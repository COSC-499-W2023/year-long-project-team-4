import os
import sys
import json
from base64 import b64encode, b64decode
import datetime
import uuid
import pathlib
import io
import random
import boto3
import time
import string

from flask import Blueprint, request, session, jsonify, current_app, send_file, Flask
from rsa import generate_key
from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA

import database
import s3Bucket
import faceBlurring
from . import bcrypt
from . import socketio

bucket = Blueprint('bucket', __name__)

LOCAL = os.getenv('LOCAL') == 'True'

if not LOCAL:
    ACCESS_KEY = os.getenv("ACCESSKEY")
    SECRET_KEY = os.getenv('SECRETKEY')
    SESSION_TOKEN = os.getenv('SESSTOKEN')
    ses_client = boto3.client(
    'ses', 
    region_name='ca-central-1',
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    aws_session_token=SESSION_TOKEN
    )
    # boto3.setup_default_session(profile_name='team4-dev')
else:
    if not os.path.isdir('verificationCode'):
        os.mkdir('verificationCode')

def get_public_key(email):
    try:
        import_string = database.query_records(table_name='userprofile', fields='publickey', condition=f'email = %s', condition_values=(email,))[0]['publickey']
        return RSA.import_key(import_string)
    except IndexError:
        return None

def get_private_key():
    return RSA.import_key(session['private_key'])

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
    video_name = request.form.get('video_name')
    recipient_email = request.form.get('recipient')
    retention_days = request.form.get('retention_days')
    tags = None
    json_data = request.files.get('json')
    if json_data:
        tags = json.loads(json_data.read())['tags']

    # Get the public key corresponding to the recipient
    recipient_public_key = get_public_key(recipient_email)

    # Figure out retention date
    if retention_days is None:
        # Default 90 days retention
        retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=90)
    else:
        # Max 1 year of retention
        retention_days = min(retention_days, 365)
        # Min 1 day of retention
        retention_days = max(retention_days, 1)
        retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=retention_days)


    # Video ID is a uniquely generated uuid value
    video_id = uuid.uuid4()

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
        if not create_chat(video_id, retention_date, sender_email, recipient_email, sender_public_key, recipient_public_key):
            return jsonify({'error': 'Failed to create chat'}), 502

    insert_result = s3Bucket.encrypt_insert('videos', encrypted_video, video_id, retention_date, sender_email, recipient_email, sender_encrypted_aes_key, recipient_encrypted_aes_key, video_name)

    if insert_result and tags:
        tag_result = database.insert_tags(video_id, tags)
        if tag_result == -1:
            return jsonify({'video_id': f'{video_id}', 'error': 'Tag upload failed'}), 503

    if insert_result and (LOCAL == False):
        sender_email = 'safemovnow@gmail.com'
    
        # Compose the email message
        subject = "You've Recieved a Video"
        html_body = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Video Received Notification</title>
            <style>
                <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
        
            h1 {
                color: #007bff;
            }
        
            p {
                margin-bottom: 20px;
            }
        </style>
            </style>
        </head>
        <body>
            <div class="container">
                <h1>A New Video!</h1>
                <p>We are pleased to inform you that you have a new video ready for viewing.</p>
                <p>Thank you for choosing SafeMov!</p>
                <p>Best regards,<br>SafeMov</p>
            </div>
        </body>
        </html>
        """

        try:
            # Send the email
            email = ses_client.send_email(
                Source=sender_email,
                Destination={'ToAddresses': [recipient_email]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {'Html': {'Data': html_body}}
                }
            )

            return jsonify({'video_id': f'{video_id}'}), 200
        except Exception as e:
            print(e)
    elif insert_result and (LOCAL == True):
        return jsonify({'video_id': f'{video_id}'}), 200
    else:
        return jsonify({'error': 'Video insertion failed'}), 502

@bucket.route('/retrieve', methods=['POST'])
def retrieve_video():
    video_id = request.form.get('video_id')

    # Retrieve the encrypted AES key and decrypt it
    query_results = database.query_records(table_name='videos', fields='senderEmail, receiverEmail, senderEncryption, receiverEncryption', condition=f'videoId = %s', condition_values=(video_id,))[0]
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
    video_path = f'/videos/{video_id}'
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
    table_join = 'videos LEFT JOIN tags ON videos.videoId=tags.videoID'
    fields = 'videos.videoId, videos.videoName, videos.senderEmail, videos.receiverEmail, videos.senderFName, videos.senderLName, tags.tagName'
    videos_with_tags = database.query_records(table_name=table_join, fields=fields, condition=f'videos.receiverEmail = %s', condition_values=(session['email'],))

    # Since videos to tags are a one to many relationship, the join will return multiple of each video if there are multiple tags
    # We need to get rid of duplicates and nicely format the tags into one list to go with each video
    available_videos_consolidated = []
    video_ids = []
    for video in videos_with_tags:
        video_id = video['videoId']
        tag = video['tagName']

        if video_id not in video_ids:
            video_ids.append(video_id)
            del video['tagName']
            video['tags'] = []
            if tag:
                video['tags'].append(tag)
            available_videos_consolidated.append(video)
        else:
            for video in available_videos_consolidated:
                if video['videoId'] == video_id:
                    video['tags'].append(tag)

    return json.dumps(available_videos_consolidated), 200
    
@bucket.route('/get_sent_videos', methods=['GET'])
def get_sent_videos():
    table_join = 'videos LEFT JOIN tags ON videos.videoId=tags.videoID'
    fields = 'videos.videoId, videos.videoName, videos.senderEmail, videos.receiverEmail, videos.senderFName, videos.senderLName, tags.tagName'
    videos_with_tags = database.query_records(table_name=table_join, fields=fields, condition=f'videos.senderEmail = %s', condition_values=(session['email'],))

    # Since videos to tags are a one to many relationship, the join will return multiple of each video if there are multiple tags
    # We need to get rid of duplicates and nicely format the tags into one list to go with each video
    available_videos_consolidated = []
    video_ids = []
    for video in videos_with_tags:
        video_id = video['videoId']
        tag = video['tagName']

        if video_id not in video_ids:
            video_ids.append(video_id)
            del video['tagName']
            video['tags'] = []
            if tag:
                video['tags'].append(tag)
            available_videos_consolidated.append(video)
        else:
            for video in available_videos_consolidated:
                if video['videoId'] == video_id:
                    video['tags'].append(tag)

    return json.dumps(available_videos_consolidated), 200

def create_chat(video_id, retention_date, sender_email, receiver_email, sender_key, receiver_key):
    chat_json = {
        'messages': []
    }

    chat_name = video_id

    # Encrypt the chat log
    encrypted_chat, aes_key = aes_encrypt_video(json.dumps(chat_json).encode('utf-8'))

    # Encrypt the AES key for both parties so it can be accessed by either
    encrypted_aes_key_sender = rsa_encrypt_aes256_key(aes_key, sender_key)
    encrypted_aes_key_receiver = rsa_encrypt_aes256_key(aes_key, receiver_key)

    # Insert the new chat into the DB and S3 bucket
    insert_result = s3Bucket.encrypt_insert('chats', encrypted_chat, chat_name, retention_date, sender_email, receiver_email, encrypted_aes_key_sender, encrypted_aes_key_receiver)

    if insert_result:
        return True
    else:
        return False


@bucket.route('/send_chat', methods=['POST'])
def send_chat():
    chat_name = request.form.get('video_id')
    chat_text = request.form.get('chat_text')

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
    object_content = s3Bucket.get_object_content(f"/chats/{chat_name}")
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
    path = f'/chats/{chat_name}'
    upload_result = s3Bucket.upload_file(encrypted_chat, path)

    if upload_result:
        return jsonify({'chat_id': path}), 200
    else:
        return jsonify({'error': 'Chat insertion failed'}), 502
    
def send_chat(name, text):
    chat_name = name
    chat_text = text
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
    object_content = s3Bucket.get_object_content(f"/chats/{chat_name}")
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
    path = f'/chats/{chat_name}'
    upload_result = s3Bucket.upload_file(encrypted_chat, path)

    if upload_result:
        # Instead of returning jsonify, return a dictionary directly
        return {
            'success': True,
            'chat_id': path,
            'message': {
                'sender': sender,  # Assuming sender's email is available
                'timestamp': timestamp,
                'message': chat_text
            }
        }
    else:
        return {'success': False, 'error': 'Chat insertion failed'}


@bucket.route('/retrieve_chat', methods=['POST'])
def retrieve_chat():
    chat_name = request.form.get('video_id')

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
    object_content = s3Bucket.get_object_content(f"/chats/{chat_name}")
    decrypted_chat = aes_decrypt_video(object_content, aes_key)
    chat_data.write(decrypted_chat)
    chat_data.seek(0)

    return send_file(chat_data, mimetype='application/json'), 200

def retrieve_chat(name):
    chat_name = name

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
    object_content = s3Bucket.get_object_content(f"/chats/{chat_name}")
    decrypted_chat = aes_decrypt_video(object_content, aes_key)
    chat_data.write(decrypted_chat)
    chat_data.seek(0)

    chat_json = json.load(chat_data)
    
    if chat_json:  # Assuming the chat_json contains the messages
        return {'success': True, 'messages': chat_json.get('messages', [])}
    else:
        return {'success': False, 'error': 'Failed to load chat data'}


@bucket.route('/change_password_reencrypt', methods=['POST'])
def change_password_reencrypt():
    new_password = request.form.get('new_password')
    if new_password is None:
        return jsonify({'error': 'Missing password'}), 400
    #Make sure user is logged in
    if 'email' in session:
        #Get videos to reencrypt
        old_private_key = get_private_key()
        user_email = session['email']
        videos_to_decrypt_received = database.query_records(table_name='videos', fields='videoId', condition=f'receiverEmail = %s', condition_values=(user_email,))
        
        #Repeat for sent
        videos_to_decrypt_sent = database.query_records(table_name='videos', fields='videoId', condition=f'senderEmail = %s', condition_values=(user_email,))
           
        #Change password, salt_hash, and pubKey
        user_id = database.query_records(table_name='userprofile', fields='id', condition=f'email = %s', condition_values=(user_email,))[0]['id']
        if not user_id:
            return jsonify({"error": 'Missing user_id'}), 400
        salt_hash = os.urandom(64)
        private_key_seed = new_password + salt_hash.hex()
        private_key = generate_key(private_key_seed)
        session['private_key'] = private_key.export_key()
        public_key = private_key.publickey().export_key('PEM')
        hashed_password = bcrypt.generate_password_hash(new_password).decode()
        #Insert new info into database
        database.update_user(user_email = user_email, new_password_hash = hashed_password, new_salt_hash = salt_hash, new_public_key = public_key)

        #Loop through videos to reencrypt and insert back to database and s3Bucket
        for sentvideos in videos_to_decrypt_sent:
            video_id = sentvideos['videoId']

            #Decrypt
            video_details = database.query_records(table_name='videos', fields='senderEncryption', condition=f'videoId = %s', condition_values=(video_id,))[0]
            encrypted_aes_key = video_details['senderEncryption']
            aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, old_private_key)

            #Reencrypt
            sender_public_key = get_public_key(user_email)
            sender_encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, sender_public_key)
            
            #Update key
            update_key = database.update_key(videoId = video_id, sender = True, receiver = False, encryptKey = sender_encrypted_aes_key)
            if update_key == False:
                return jsonify({"status": "error",'message': 'Key update failed'}), 502

        #Repeat but for recieved videos
        for receivedvideos in videos_to_decrypt_received:
            video_id = receivedvideos['videoId']

            #Decrypt
            video_details = database.query_records(table_name='videos', fields='receiverEncryption', condition=f'videoId = %s', condition_values=(video_id,))[0]
            encrypted_aes_key = video_details['receiverEncryption']
            aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, old_private_key)
            
            #Reencrypt
            recipient_public_key = get_public_key(user_email)
            recipient_encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, recipient_public_key)
            
            #Update key
            update_key = database.update_key(videoId = video_id, sender = False, receiver = True, encryptKey = recipient_encrypted_aes_key)
            if update_key == False:
                return jsonify({"status": "error",'message': 'Key update failed'}), 502
                    
        #Check if password has been changed
        current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'email = %s', condition_values=(user_email,))[0]['password_hash']
        if current_password == hashed_password:
            return (jsonify({"status": "success", "message": "password changed"}),200)
        else:
            return (jsonify({"status": "error", "message": f"password not changed {current_password}"}), 502)
    else:
        return jsonify({"status": "error",'message': 'User not logged in'}), 502
                
@bucket.route('/set_verificationcode', methods=['POST'])
def set_verificationcode():
    email = request.form.get('email')
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    
    #Create verification code
    created_code = ''.join(random.choices(string.digits, k=6))
    update_data = {'verifyKey': f'{created_code}'}
    database.update_user(user_email = email, new_verify_key = created_code)
    #Save code locally if Local is true
    if LOCAL:
        obj_path = f"./verificationCode"
        completeName = os.path.join(obj_path, "code.txt")   
        file = open(completeName, "w")
        file.write(created_code)
        file.close()
        return jsonify({"status": "success", "message": "code saved locally"}), 200
    #Send user an email with code
    try:
        response = ses_client.send_email(
            Source='safemovnow@gmail.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Password Change Verification Code'},
                'Body': {'Text': {'Data': f'Your verification code is: {created_code}'}}
            }
        )
        return jsonify({"status": "success", "message": "email sent"}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"error": "Failed to send verification code via email"}), 502
                
@bucket.route('/change_password_forgot', methods=['POST'])
def change_password_forgot():
    email = request.form.get('email')
    new_password = request.form.get('new_password')
    input_code = request.form.get('input_code')
    old_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'email = %s', condition_values=(email,))[0]['password_hash']
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    if new_password is None:
        return jsonify({'error': 'Missing password'}), 400
    if input_code is None:
        return jsonify({'error': 'Missing input_code'}), 400
    if not old_password:
        return jsonify({"error": 'Missing user_password'}), 400
    #Get code
    created_code = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=(email,))[0]['verifyKey']
    #Verify user input correct code
    if input_code == created_code:
        #Change password, salt_hash, and pubKey
        user_id = database.query_records(table_name='userprofile', fields='id', condition=f'email = %s', condition_values=(email,))[0]['id']
        if not user_id:
            return jsonify({"error": 'Missing user_id'}), 400
        salt_hash = os.urandom(64)
        private_key_seed = new_password + salt_hash.hex()
        private_key = generate_key(private_key_seed)
        public_key = private_key.publickey().export_key('PEM')
        hashed_password = bcrypt.generate_password_hash(new_password).decode()
        #Insert new info into database
        database.update_user(user_email = email, new_password_hash = hashed_password, new_salt_hash = salt_hash, new_public_key = public_key)
        
        #Get recieved videos that need key deleted
        videos_to_delete_key = database.query_records(table_name='videos', fields='videoId', condition=f'receiverEmail = %s', condition_values=(email,))
        #Loop through list, deleting files individually
        for videos in videos_to_delete_key:
            #Delete key from database for recieved videos
            database.delete_key(videoId = videos['videoId'],sender =False,receiver =True)
        #Get recieved videos that need key deleted
        videos_to_delete_key = database.query_records(table_name='videos', fields='videoId', condition=f'senderEmail = %s', condition_values=(email,))
        #Loop through list, deleting files individually
        for videos in videos_to_delete_key:
            #Delete key from database for recieved videos
            database.delete_key(videoId = videos['videoId'],sender =True,receiver =False)
            
        current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'email = %s', condition_values=(email,))[0]['password_hash']
        if current_password == hashed_password:
            return (jsonify({"status": "success", "message": "codes match, password changed"}),200)
        else:
            return (jsonify({"status": "error", "message": f"password not changed {current_password}"}), 502)
    elif input_code != created_code:
        return (jsonify({"status": "error", "message": "codes do not match"}),502)
    else:
        return (jsonify({"status": "error", "message": "code not found"}), 502)
  
@bucket.route('/blurRequest', methods=['POST'])
def processVideo():
    file = request.files.get('file')

    if file is None:
        return jsonify({'error': 'No file found'}), 400
    
    # Check if the temp folder is made or not - create it if not 
    upload_directory = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'faceBlurring', 'temp'))    
    if not os.path.exists(upload_directory):
        os.makedirs(upload_directory)
        
    # Generate random string uuid to avoid clashing with names - Save video locally 
    video_id = str(uuid.uuid4()) + ".mp4"
    upload_path = os.path.join(upload_directory, video_id)
    file.save(upload_path)

    # Initiate the blurring process
    faceBlurring.process_video(upload_path)
    # Get the new video & send it back to the front-end 
    blurred_upload_path = os.path.join(upload_directory, 'blurred_' + video_id)
    with open(blurred_upload_path, "rb") as video_file:
        video_data = io.BytesIO(video_file.read())

    # Set buffer cursor to 0 again since it is by default at the last byte
    video_data.seek(0)
    # Remove files to keep folder clean and size down 
    os.remove(blurred_upload_path)
    os.remove(upload_path)
    return send_file(video_data, mimetype='video/mp4')
