import pytest
import sys
import os
import json
sys.path.append(os.path.abspath('../app'))

from Crypto import Random
from Crypto.PublicKey import RSA
from rsa import generate_key

import database
import flaskapp


@pytest.fixture
def app():
    app = flaskapp.create_app()
    app.config['TESTING'] = True
    yield app

@pytest.fixture
def client(app):
    return app.test_client()


# Tests that we can successfully create chats when a video is sent
def test_create_chat_success(client):
    # Setup some test data
    sender_post_object = {'email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    receiver_post_object = {'email': 'example@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data = {
        'recipient': receiver_post_object['email'],
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    response = json.loads(client.post('/auth/signup', data=receiver_post_object).data.decode('utf-8'))
    assert not 'error' in response
    response = json.loads(client.post('/auth/signup', data=sender_post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Upload our test video to create the chat
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))
    assert not 'error' in upload_response

    # Retrieve the chat, ensure chat matches expected start state
    data = {'video_name': upload_response['video_id']}
    response = json.loads(client.post('/bucket/retrieve_chat', data=data).data.decode('utf-8'))
    assert not 'error' in response
    assert 'messages' in response
    assert response['messages'] == []

# Tests that videos sent from guest accounts do not create chats
def test_create_chat_fail(client):
    # Setup some test data
    receiver_post_object = {'email': 'example@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data = {
        'recipient': receiver_post_object['email'],
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    response = json.loads(client.post('/auth/signup', data=receiver_post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Logout so we are sending from guest
    response = json.loads(client.get('/auth/logout').data.decode('utf-8'))
    assert 'success' in response

    # Upload our test video, should not create chat because we are logged in as guest
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))
    assert not 'error' in upload_response

    # Try to retrieve chat, ensure it does not exist
    data = {'video_name': upload_response['video_id']}
    response = json.loads(client.post('/bucket/retrieve_chat', data=data).data.decode('utf-8'))
    assert 'error' in response
    assert response['error'] == 'Chat does not exist'

# Tests that we can use the created chats to send messages between accounts
def test_send_receive_chat(client):
    # Setup some test data
    sender_post_object = {'email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    receiver_post_object = {'email': 'example@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data = {
        'recipient': receiver_post_object['email'],
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    response = json.loads(client.post('/auth/signup', data=receiver_post_object).data.decode('utf-8'))
    assert not 'error' in response
    response = json.loads(client.post('/auth/signup', data=sender_post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Upload our test video to create the chat
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))
    assert not 'error' in upload_response

    # Send a few chats
    for i in range(3):
        data = {'video_name': upload_response['video_id'], 'chat_text': i}
        response = json.loads(client.post('/bucket/send_chat', data=data).data.decode('utf-8'))
        assert not 'error' in response
        assert 'chat_id' in response

    # Retrieve chat from sender POV and ensure it matches expectations
    data = {'video_name': upload_response['video_id']}
    response = json.loads(client.post('/bucket/retrieve_chat', data=data).data.decode('utf-8'))
    assert not 'error' in response
    assert 'messages' in response
    assert len(response['messages']) == 3
    assert response['messages'][0]['message'] == '0'
    assert response['messages'][1]['message'] == '1'
    assert response['messages'][2]['message'] == '2'

    # Login from receiver side
    login_response = json.loads(client.post('/auth/login', data=receiver_post_object).data.decode('utf-8'))
    assert login_response.get('email') == receiver_post_object['email'] # Ensure we are now logged in

    # Retrieve chat from receiver POV and ensure it matches expectations
    data = {'video_name': upload_response['video_id']}
    response = json.loads(client.post('/bucket/retrieve_chat', data=data).data.decode('utf-8'))
    assert not 'error' in response
    assert 'messages' in response
    assert len(response['messages']) == 3
    assert response['messages'][0]['message'] == '0'
    assert response['messages'][1]['message'] == '1'
    assert response['messages'][2]['message'] == '2'
