import s3Bucket
import database
from main import socketio
from flask_socketio import emit
from .bucket_interface import aes_encrypt_video, rsa_encrypt_aes256_key, get_public_key # Assuming you have these utilities
import json
import datetime

@socketio.on('create_chat')
def handle_create_chat(data):
    chat_name = data['video_name']
    dummy_retention_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    chat_json = {'messages': []}

    print("checking if in")

    # Query the database for video info
    query_results = database.query_records(table_name='videos', fields='senderEmail, receiverEmail', condition='videoName = %s', condition_values=(chat_name,))
    if not query_results:
        emit('chat_response', {'error': 'Associated video does not exist'})
        return

    query_results = query_results[0]
    video_sender_email, video_receiver_email = query_results['senderEmail'], query_results['receiverEmail']

    if not video_sender_email or not video_receiver_email:
        emit('chat_response', {'error': 'Invalid users associated with video, perhaps one account is guest?'})
        return

    if database.query_records(table_name='chats', fields='chatName', condition='chatName = %s', condition_values=(chat_name,)):
        emit('chat_response', {'error': 'Associated chat already exists'})
        return

    sender_key, receiver_key = get_public_key(video_sender_email), get_public_key(video_receiver_email)
    if not sender_key or not receiver_key:
        emit('chat_response', {'error': 'Could not get public key for one of the users'})
        return

    encrypted_chat, aes_key = aes_encrypt_video(json.dumps(chat_json).encode('utf-8'))
    encrypted_aes_key_sender = rsa_encrypt_aes256_key(aes_key, sender_key)
    encrypted_aes_key_receiver = rsa_encrypt_aes256_key(aes_key, receiver_key)

    insert_result = s3Bucket.encrypt_insert('chats', encrypted_chat, chat_name, dummy_retention_date, video_sender_email, video_receiver_email, encrypted_aes_key_sender, encrypted_aes_key_receiver)
    if insert_result:
        emit('chat_response', {'status': 'success', 'chat_id': chat_name})
    else:
        emit('chat_response', {'error': 'Chat insertion failed'})
