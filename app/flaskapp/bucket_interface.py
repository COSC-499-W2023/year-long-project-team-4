import os
import sys
import json
from base64 import b64encode, b64decode
import datetime
import uuid
import pathlib
import io

from flask import Blueprint, request, session, jsonify, current_app, send_file
from rsa import generate_key
from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA

import s3Bucket
import database

bucket = Blueprint('bucket', __name__)

def get_public_key(email):
    try:
        import_string = database.query_records(table_name='userprofile', fields='publickey', condition=f'email = %s', condition_values=(email,), testcase=current_app.testing)[0]['publickey']
        return RSA.import_key(import_string)
    except IndexError:
        return None

def get_private_key():
    return generate_key(session['pkey_seed'])

def aes_encrypt_video(data):
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
    public_key = get_public_key(recipient_email)

    # Should read retention date from post, but for now just set it to 7 days in future
    dummy_retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)

    # Video name is a uniquely generated uuid value
    video_name = uuid.uuid4()

    # Ensure that we actually got a file and that the recipient email is valid
    if file is None:
        print('No file found')
        return jsonify({'error': 'No file found'}), 400
    if public_key is None:
        print('Invalid recipient')
        return jsonify({'error': 'Invalid recipient'}), 400

    # Read the file into bytes so we can encrypt
    content = file.read()

    # Encrypt the video using AES, then encrypt the AES key
    encrypted_video, aes_key = aes_encrypt_video(content)
    encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, public_key)

    # If user is guest, sender_id is empty string - otherwise, sender_id is the userid
    sender_id = ''
    if 'username' in session:
        sender_id = database.query_records(table_name='userprofile', fields='id', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['id']

    insert_result = s3Bucket.encrypt_insert('team4-s3', encrypted_video, f'/tests/{video_name}', dummy_retention_date, sender_id, recipient_email, encrypted_aes_key)

    if insert_result:
        return jsonify({'video_id': video_name}), 200
    else:
        return jsonify({'error': 'Video insertion failed'}), 502

@bucket.route('/retrieve', methods=['POST'])
def retrieve_video():
    video_name = request.form.get('video_name')

    # Retrieve the encrypted AES key and decrypt it
    encrypted_aes_key = database.query_records(table_name='videos', fields='encrpyt', condition=f'videoName = %s', condition_values=(video_name,), testcase=current_app.testing)[0]['encrpyt']
    aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, get_private_key())

    # Download the encrypted video from S3
    s3Bucket.download_files('team4-s3', video_name, './encrypted_video')

    # Decrypt the file and write the data to an IO buffer
    video_data = io.BytesIO()
    with open('./encrypted_video', 'rb') as read_file:
        decrypted_video = aes_decrypt_video(read_file.read(), aes_key)
        video_data.write(decrypted_video)

    # Delete the temporary file
    pathlib.Path.unlink('./encrypted_video')

    # Set buffer cursor to 0 again since it is by default at the last byte
    video_data.seek(0)

    # Send the data in the buffer as mp4
    return send_file(video_data, mimetype='video/mp4'), 200

@bucket.route('/getvideos', methods=['GET'])
def get_available_videos():
    user_id = database.query_records(table_name='userprofile', fields='id', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['id']
    available_videos = database.query_records(table_name='videos', fields='videoName, senderID', condition=f'recieverID = %s', condition_values=(user_id,), testcase=current_app.testing)
    return json.dumps(available_videos), 200
