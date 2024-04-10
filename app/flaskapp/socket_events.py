from flask import request
from . import socketio
from flask_socketio import join_room, emit
from .bucket_interface import send_chat, retrieve_chat
from flask import session

@socketio.on('message')
def handle_message(data):
    socketio.emit('message', data)

@socketio.on('join_chat')
def handle_join_chat(data):
    chat_name = data['chat_name']
    join_room(chat_name)

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

    if result['success']:
        # Broadcast the new message to all clients in the room
        emit('new_chat_message', result['message'], room=chat_name)
    else:
        # Send an error message back to the sender
        emit('chat_error', {'error': result['error']}, room=request.sid)
