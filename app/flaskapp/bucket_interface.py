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

from flask import Blueprint, request, session, jsonify, current_app, send_file, Flask
from rsa import generate_key
from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
from flask_redis import FlaskRedis

import s3Bucket
import database

bucket = Blueprint('bucket', __name__)
app = Flask(__name__)
app.config['REDIS_URL'] = "redis://localhost:6379/0"
redis = FlaskRedis(app)

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
        return jsonify({'error': 'No file found'}), 400
    if public_key is None:
        return jsonify({'error': 'Invalid recipient'}), 400

    # Read the file into bytes so we can encrypt
    content = file.read()

    # Encrypt the video using AES, then encrypt the AES key
    encrypted_video, aes_key = aes_encrypt_video(content)
    encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, public_key)

    # If user is guest, sender_email is empty string - otherwise, sender_email is the sender's email
    sender_email = ''
    if 'username' in session:
        sender_email = database.query_records(table_name='userprofile', fields='email', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['email']

    insert_result = s3Bucket.encrypt_insert('videos', encrypted_video, video_name, dummy_retention_date, sender_email, recipient_email, encrypted_aes_key, testcase=current_app.testing)

    if insert_result:
        return jsonify({'video_id': f'/videos/{recipient_email}/{video_name}'}), 200
    else:
        return jsonify({'error': 'Video insertion failed'}), 502

@bucket.route('/retrieve', methods=['POST'])
def retrieve_video():
    video_name = request.form.get('video_name')

    # Retrieve the encrypted AES key and decrypt it
    encrypted_aes_key = database.query_records(table_name='videos', fields='encrpyt', condition=f'videoName = %s', condition_values=(video_name,), testcase=current_app.testing)[0]['encrpyt']
    aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, get_private_key())

    # Decrypt the file and write the data to an IO buffer
    video_data = io.BytesIO()
    object_content = s3Bucket.get_object_content(video_name)
    decrypted_video = aes_decrypt_video(object_content, aes_key)
    video_data.write(decrypted_video)

    # Set buffer cursor to 0 again since it is by default at the last byte
    video_data.seek(0)

    # Send the data in the buffer as mp4
    return send_file(video_data, mimetype='video/mp4'), 200

@bucket.route('/getvideos', methods=['GET'])
def get_available_videos():
    user_id = database.query_records(table_name='userprofile', fields='id', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['id']
    available_videos = database.query_records(table_name='videos', fields='videoName, senderID', condition=f'recieverID = %s', condition_values=(user_id,), testcase=current_app.testing)
    return json.dumps(available_videos), 200

@bucket.route('/change_password_reencrypt/<new_password>', methods=['POST'])
def change_password_reencrypt(new_password):
    #Make sure user is logged in
    if 'username' in session:
        #Get videos to reencrypt
        user_email = database.query_records(table_name='userprofile', fields='email', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['email']
        videos_to_decrypt = database.query_records(table_name='videos', fields='videoName', condition=f'recieverEmail = %s', condition_values=(user_email,), testcase=current_app.testing)[0]['videoName'].append(database.query_records(table_name='videos', fields='videoName', condition=f'senderEmail = %s', condition_values=(user_email,), testcase=current_app.testing))[0]['videoName']
        #Loop through list, decrypting videos
        videos_to_reencrypt= []
        for items1 in videos_to_decrypt:
            #Get aes_key to decrypt
            encrypted_aes_key = database.query_records(table_name='videos', fields='encrpyt', condition=f'videoName = %s', condition_values=(videos_to_decrypt[items1],), testcase=current_app.testing)[0]['encrpyt']
            aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, get_private_key())
            #Decrypt
            object_content = s3Bucket.get_object_content(videos_to_decrypt[items1])
            videos_to_reencrypt[items1] = aes_decrypt_video(object_content, aes_key)
        #Change password
        user_password = database.query_records(table_name='userprofile', fields='password', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['password']
        database.update_data = {user_password: new_password}
        #Loop through videos to reencrypt and insert back to database and s3Bucket
        for items2 in videos_to_reencrypt:
            #Reencrypt
            video = videos_to_reencrypt[items2].read()
            encrypted_video, aes_key = aes_encrypt_video(video)
            #Get public key to insert into s3Bucket
            email = database.query_records(table_name='userprofile', fields='email', condition=f'username = %s', condition_values=(session['username'],), testcase=current_app.testing)[0]['email']
            public_key = get_public_key(email)
            encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, public_key)
            #Insert into s3Bucket (sent videos first)
            video_details = database.query_records(table_name='videos', fields='videoName, retDate, recieverID', condition=f'senderID = %s', condition_values=(user_email,), testcase=current_app.testing)
            for items3 in video_details:
                video_name = video_details[items3].get("videoName")
                retention_date = video_details[items3].get("retDate")
                recieverID = video_details[items3].get("recieverID")
                recipient_email = database.query_records(table_name='userprofile', fields='email', condition=f'id = %s', condition_values=(recieverID,), testcase=current_app.testing)[0]['email']
                insert_video = s3Bucket.encrypt_insert('videos', encrypted_video, video_name, retention_date, email, recipient_email, encrypted_aes_key, testcase=current_app.testing)
                if not insert_video:
                    return jsonify({'error': 'Video insertion failed'}), 502
            #Repeat but for recieved videos
            video_details = database.query_records(table_name='videos', fields='videoName, retDate, senderID', condition=f'recieverID = %s', condition_values=(user_email,), testcase=current_app.testing)
            for items4 in video_details:
                video_name = video_details[items4].get("videoName")
                retention_date = video_details[items4].get("retDate")
                senderID = video_details[items4].get("recieverID")
                sender_email = database.query_records(table_name='userprofile', fields='email', condition=f'id = %s', condition_values=(senderID,), testcase=current_app.testing)[0]['email']
                insert_video = s3Bucket.encrypt_insert('videos', encrypted_video, video_name, retention_date, sender_email, email, encrypted_aes_key, testcase=current_app.testing)
                if not insert_video:
                    return jsonify({'error': 'Video insertion failed'}), 502
        return jsonify({'video_id': f'/videos/{recipient_email}/{video_name}'}), 200
    else:
        return jsonify({'error': 'USer not logged in'}), 502
                
@bucket.route('/set_verificationcode/<email>', methods=['POST'])
def set_verificationcode_input(email):
    #Create verification code
    created_code = random.choice(range(100000, 999999))
    #Store code in Redis
    key = f"number:{email}:code"
    redis.set(key, created_code)
    #Send user an email with code
    try:
        ses_client = boto3.client('ses', region_name='ca-central-1')
        response = ses_client.send_email(
            Source='safemovnow@gmail.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Password Change Verification Code'},
                'Body': {'Text': {'Data': f'Your verification code is: {created_code}'}}
            }
        )
    except Exception as e:
        print(f"Error sending email: {e}")
        return {"error": "Failed to send verification code via email"}
         
@bucket.route('/get_verificationcode_input', methods=['GET'])
def get_verificationcode_input():
    #Get user's input verificaton code
    input_code = request.form.get('verification_input')
    return input_code
                
@bucket.route('/change_password_forgot/<email>/<new_password>/<input_code>', methods=['POST'])
def change_password_forgot(email,new_password,input_code):
    #Get code from redis
    key = f"number:{email}:code"
    created_code = redis.get(key)
    #Verify user input correct code
    if input_code == created_code:
        #Change password
        user_password = database.query_records(table_name='userprofile', fields='password', condition=f'email = %s', condition_values=(email,), testcase=current_app.testing)[0]['password']
        database.update_data = {user_password: new_password}
        #Get recieved videos that need key deleted
        videos_to_delete_key = database.query_records(table_name='videos', fields='videoName', condition=f'recieverID = %s', condition_values=(email,), testcase=current_app.testing)[0]['videoName']
        #Loop through list, deleting files individually
        for items1 in videos_to_delete_key:
            #Delete key from database for recieved videos
            database.delete_key(videos_to_delete_key[items1],False,True)
        #Get recieved videos that need key deleted
        videos_to_delete_key = database.query_records(table_name='videos', fields='videoName', condition=f'senderID = %s', condition_values=(email,), testcase=current_app.testing)[0]['videoName']
        #Loop through list, deleting files individually
        for items2 in videos_to_delete_key:
            #Delete key from database for recieved videos
            database.delete_key(videos_to_delete_key[items2],True,False)
        return (jsonify({"status": "success", "message": "codes match, password changed"}),200,)
    elif input_code != created_code:
        return (jsonify({"status": "rejected", "message": "codes do not match",}),404,)
    else:
        return (jsonify({"status": "failed", "message": "code not found"}), 500)