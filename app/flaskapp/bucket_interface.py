import os
import sys
import json
from base64 import b64encode, b64decode
import datetime
import uuid
import pathlib
import io
import time

from flask import Blueprint, request, session, jsonify, send_file
from rsa import generate_key
from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA

import s3Bucket
import database
import faceBlurring

bucket = Blueprint('bucket', __name__)

def get_public_key(email):
    try:
        import_string = database.query_records(table_name='userprofile', fields='publickey', condition=f'email = %s', condition_values=(email,))[0]['publickey']
        return RSA.import_key(import_string)
    except IndexError:
        return None

def get_private_key():
    return generate_key(session['pkey_seed'])

def aes_encrypt_video(data, aes256_key=None):
    if aes256_key is None:
        aes256_key = Random.get_random_bytes(32)
    cipher = AES.new(aes256_key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    result_json = {
        'nonce': b64encode(cipher.nonce).decode('utf-8'),
        'ciphertext': b64encode(ciphertext).decode('utf-8'),
        'tag': b64encode(tag).decode('utf-8')
    }
    return json.dumps(result_json), aes256_key

def aes_decrypt_video(data_json, aes256_key):
    b64 = json.loads(data_json)
    nonce = b64decode(b64['nonce'])
    ciphertext = b64decode(b64['ciphertext'])
    tag = b64decode(b64['tag'])

    cipher = AES.new(aes256_key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext

def rsa_encrypt_aes256_key(aes256_key, rsa_public_key):
    cipher = PKCS1_v1_5.new(rsa_public_key)
    cipher_text = cipher.encrypt(aes256_key)
    return b64encode(cipher_text)

def rsa_decrypt_aes256_key(encrypted_aes256_key, rsa_private_key):
    decipher = PKCS1_v1_5.new(rsa_private_key)
    aes256_key = decipher.decrypt(b64decode(encrypted_aes256_key), None)
    return aes256_key

@bucket.route('/upload', methods=['POST'])
def upload_video():
    # Read the file and email from post
    file = request.files.get('file')
    recipient_email = request.form.get('recipient')

    # Get the public key corresponding to the recipient
    recipient_public_key = get_public_key(recipient_email)

    # Should read retention date from post, but for now just set it to 7 days in future
    dummy_retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)

    # Video name is a uniquely generated uuid value
    video_name = uuid.uuid4()

    # Ensure that we actually got a file and that the recipient email is valid
    if file is None:
        return jsonify({'error': 'No file found'}), 400
    if recipient_public_key is None:
        return jsonify({'error': 'Invalid recipient'}), 400

    # Read the file into bytes so we can encrypt
    content = file.read()

    # Encrypt the video using AES, then encrypt the AES key
    encrypted_video, aes_key = aes_encrypt_video(content)
    recipient_encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, recipient_public_key)
    sender_encrypted_aes_key = None

    # If user is guest, sender_email is empty string - otherwise, sender_email is the sender's email
    sender_email = ''
    if 'email' in session:
        sender_email = session['email']
        sender_public_key = get_public_key(session['email'])
        sender_encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, sender_public_key)

    insert_result = s3Bucket.encrypt_insert('videos', encrypted_video, video_name, dummy_retention_date, sender_email, recipient_email, sender_encrypted_aes_key, recipient_encrypted_aes_key)

    if insert_result:
        return jsonify({'video_id': f'{video_name}'}), 200
    else:
        return jsonify({'error': 'Video insertion failed'}), 502

@bucket.route('/retrieve', methods=['POST'])
def retrieve_video():
    video_name = request.form.get('video_name')

    # Retrieve the encrypted AES key and decrypt it
    query_results = database.query_records(table_name='videos', fields='senderEmail, receiverEmail, senderEncryption, receiverEncryption', condition=f'videoName = %s', condition_values=(video_name,))[0]
    encrypted_aes_key = None
    receiver_email = query_results['receiverEmail']
    sender_email = query_results['senderEmail']

    if session['email'] == receiver_email:
        encrypted_aes_key = query_results['receiverEncryption']
    elif session['email'] == sender_email:
        encrypted_aes_key = query_results['senderEncryption']

    if encrypted_aes_key is None:
        return jsonify({'error': 'Currently logged in user is neither sender or receiver of requested video'}), 409

    aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, get_private_key())
    video_path = f'/videos/{receiver_email}/{video_name}'

    # Decrypt the file and write the data to an IO buffer
    video_data = io.BytesIO()
    object_content = s3Bucket.get_object_content(video_path)
    decrypted_video = aes_decrypt_video(object_content, aes_key)
    video_data.write(decrypted_video)

    # Set buffer cursor to 0 again since it is by default at the last byte
    video_data.seek(0)

    # Send the data in the buffer as mp4
    return send_file(video_data, mimetype='video/mp4'), 200

@bucket.route('/getvideos', methods=['GET'])
def get_available_videos():
    available_videos = database.query_records(table_name='videos', fields='videoName, senderEmail', condition=f'receiverEmail = %s', condition_values=(session['email'],))
    return json.dumps(available_videos), 200

@bucket.route('/get_sent_videos', methods=['GET'])
def get_sent_videos():
    available_videos = database.query_records(table_name='videos', fields='videoName, receiverEmail', condition=f'senderEmail = %s', condition_values=(session['email'],))
    return json.dumps(available_videos), 200

@bucket.route('/create_chat', methods=['POST'])
def create_chat():
    dummy_retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    chat_json = {
        'messages': []
    }

    # Read video name associated with the new chat, and ensure that said video exists
    chat_name = request.form.get('video_name')
    query_results = database.query_records(table_name='videos', fields='senderEmail, receiverEmail', condition=f'videoName = %s', condition_values=(chat_name,))
    if not query_results:
        return jsonify({'error': 'Associated video does not exist'}), 409

    query_results = query_results[0]
    video_sender_email = query_results['senderEmail']
    video_receiver_email = query_results['receiverEmail']

    if video_sender_email is None or video_receiver_email is None:
        return jsonify({'error': 'Invalid users associated with video, perhaps one account is guest?'}), 409

    # Ensure chat not already created
    if database.query_records(table_name='chats', fields='chatName', condition=f'chatName = %s', condition_values=(chat_name,)):
        return jsonify({'error': 'Associated chat already exists'}), 409

    sender_key = get_public_key(video_sender_email)
    if sender_key is None:
        return jsonify({'error': 'Could not get video sender public key'}), 409

    receiver_key = get_public_key(video_receiver_email)
    if receiver_key is None:
        return jsonify({'error': 'Could not get video recipient public key'}), 409

    # Encrypt the chat log
    encrypted_chat, aes_key = aes_encrypt_video(json.dumps(chat_json).encode('utf-8'))

    # Encrypt the AES key for both parties so it can be accessed by either
    encrypted_aes_key_sender = rsa_encrypt_aes256_key(aes_key, sender_key)
    encrypted_aes_key_receiver = rsa_encrypt_aes256_key(aes_key, receiver_key)

    # Insert the new chat into the DB and S3 bucket
    insert_result = s3Bucket.encrypt_insert('chats', encrypted_chat, chat_name, dummy_retention_date, video_sender_email, video_receiver_email, encrypted_aes_key_sender, encrypted_aes_key_receiver)

    if insert_result:
        return jsonify({'chat_id': f'{chat_name}'}), 200
    else:
        return jsonify({'error': 'Chat insertion failed'}), 502


@bucket.route('/send_chat', methods=['POST'])
def send_chat():
    chat_name = request.form.get('video_name')
    chat_text = request.form.get('chat_text')
    dummy_retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)

    try:
        chat_info = database.query_records(table_name='chats', fields='senderEmail, senderEncryption, receiverEmail, receiverEncryption', condition=f'chatName = %s', condition_values=(chat_name,))[0]
    except IndexError:
        return jsonify({'error': 'Chat does not exist'}), 400


    # Figure out which participant the current user is and load the correct encrypted key
    encrypted_aes_key = None
    if session['email'] == chat_info['senderEmail']:
        encrypted_aes_key = chat_info['senderEncryption']
    elif session['email'] == chat_info['receiverEmail']:
        encrypted_aes_key = chat_info['receiverEncryption']

    # Decrypt the AES key
    aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, get_private_key())

    # Decrypt the file and write the data to an IO buffer
    chat_data = io.BytesIO()
    object_content = s3Bucket.get_object_content(f"/chats/{chat_info['receiverEmail']}/{chat_name}")
    decrypted_chat = aes_decrypt_video(object_content, aes_key)
    chat_data.write(decrypted_chat)
    chat_data.seek(0)

    # Load chat data into json to be worked with
    chat_json = json.load(chat_data)

    # Create the dict that gets appended to the chat log
    timestamp = time.time()
    sender = session['email']
    msg_bundle = {
        'sender': sender,
        'timestamp': timestamp,
        'message': chat_text
    }

    # Add our message to the chat log
    chat_json['messages'].append(msg_bundle)

    # Encrypt the chat log using same AES key as before - this avoid having to update the keys in the database every time the chat is appended to
    encrypted_chat, _ = aes_encrypt_video(json.dumps(chat_json).encode('utf-8'), aes_key)

    # Directly upload to S3 since no DB changes are made
    path = f'/chats/{chat_info["receiverEmail"]}/{chat_name}'
    upload_result = s3Bucket.upload_file(encrypted_chat, path)

    if upload_result:
        return jsonify({'chat_id': path}), 200
    else:
        return jsonify({'error': 'Chat insertion failed'}), 502


@bucket.route('/retrieve_chat', methods=['POST'])
def retrieve_chat():
    chat_name = request.form.get('video_name')

    try:
        # Retrieve info for requested chat
        chat_info = database.query_records(table_name='chats', fields='senderEmail, senderEncryption, receiverEmail, receiverEncryption', condition=f'chatName = %s', condition_values=(chat_name,))[0]
    except IndexError:
        return jsonify({'error': 'Chat does not exist'}), 400

    # Figure out which participant the current user is and load the correct encrypted key
    encrypted_aes_key = None
    if session['email'] == chat_info['senderEmail']:
        encrypted_aes_key = chat_info['senderEncryption']
    elif session['email'] == chat_info['receiverEmail']:
        encrypted_aes_key = chat_info['receiverEncryption']

    if encrypted_aes_key is None:
        return jsonify({'error': 'Current user not participant in requested chat'}), 400

    # Decrypt the AES key
    aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, get_private_key())

    # Decrypt the file and write the data to an IO buffer
    chat_data = io.BytesIO()
    object_content = s3Bucket.get_object_content(f"/chats/{chat_info['receiverEmail']}/{chat_name}")
    decrypted_chat = aes_decrypt_video(object_content, aes_key)
    chat_data.write(decrypted_chat)
    chat_data.seek(0)

    return send_file(chat_data, mimetype='application/json'), 200


@bucket.route('/blurRequest', methods=['POST'])
def processVideo():
    file = request.files.get('file')

    if file is None:
        return jsonify({'error': 'No file found'}), 400
    upload_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'faceBlurring', 'temp'))    
    video_name = str(uuid.uuid4())+".mp4"
    upload_path = os.path.join(upload_directory,video_name)
    file.save(upload_path)
    print(f'upload_directory: {upload_directory}')
    print(f'upload_path: {upload_path}')
    print(f'File received: {file.filename}')

    faceBlurring.process_video(upload_path)
    
    blurred_upload_path = os.path.join(upload_directory, 'blurred_' + video_name)  
    print(f'blurred_upload_path: {blurred_upload_path}')
    return send_file(blurred_upload_path, as_attachment=True, mimetype='video/mp4')
