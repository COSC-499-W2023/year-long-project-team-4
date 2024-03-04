from flask import request
from . import socketio
from flask_socketio import join_room, emit
#from . import bucket_interface
from .bucket_interface import send_chat, retrieve_chat
from flask import session


users = {}

@socketio.on('connect')
def handle_connect():
    user_email = session.get('email')
    print(user_email)
    if user_email:
        users[request.sid] = user_email
        emit('connected', {'email': user_email})
    else:
        print("No user email in session")

@socketio.on('disconnect')
def handle_disconnect():
    users.pop(request.sid, None)

@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)
    socketio.emit('message', data)

@socketio.on('join_chat')
def handle_join_chat(data):
    chat_name = data['chat_name']
    join_room(chat_name)
    print(f"User joined chat: {chat_name}")

    chat_history = retrieve_chat(chat_name)
    if chat_history['success']:
        emit('chat_history', chat_history['messages'], room=request.sid)
    else:
        emit('chat_error', {'error': chat_history['error']}, room=request.sid)

@socketio.on('send_chat_message')
def handle_send_chat_message(data):
    chat_name = data['chat_name']
    chat_text = data['message']

    result = send_chat(chat_name, chat_text)
    print(result)

    if result['success']:
        # Broadcast the new message to all clients in the room
        print("i am here")
        emit('new_chat_message', result['message'], room=chat_name)
    else:
        # Send an error message back to the sender
        emit('chat_error', {'error': result['error']}, room=request.sid)
