import pytest
import sys
import os
import json

sys.path.append(os.path.abspath('../app'))
# sys.path.append(os.path.abspath('../app/flaskapp'))

import flaskapp
import database

@pytest.fixture
def app():
    app = flaskapp.create_app()
    app.config['TESTING'] = True
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_send_email(client):
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data = {
        'recipient': 'fakeusertest987@gmail.com',
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'b', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Upload our test video
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))
    print(upload_response)
    assert not 'error' in upload_response
    
if __name__ == "__main__":
    app = flaskapp.create_app()
    app.config['TESTING'] = True
    test_send_email(app.test_client())   
