import pytest
import sys
import os
import json

sys.path.append(os.path.abspath('../app'))
sys.path.append(os.path.abspath('../flaskapp'))
import database
import s3Bucket
import flaskapp

@pytest.fixture
def app():
    app = flaskapp.create_app()
    app.config['TESTING'] = True
    yield app
    
@pytest.fixture
def client(app):
    return app.test_client()

def test_change_password_reencrypt(client):
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    #Insert user to recieve test video
    post_object2 = {'email': 'safemovnow@gmail.com', 'password': 'test_Password1@', 'firstname': 'John2', 'lastname': 'Doe2'}
    response = json.loads(client.post('/auth/signup', data=post_object2).data.decode('utf-8'))
    assert not 'error' in response
    
    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('safemovnow@gmail.com',))[0]['verifyKey']
    post_object = {'input_code': f'{inputcode}', 'email': 'safemovnow@gmail.com'}
    response = json.loads(client.post('/auth/confirm_user', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    #Insert User that will have password changed
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'test_Password1@', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('fakeusertest987@gmail.com',))[0]['verifyKey']
    post_object = {'input_code': f'{inputcode}', 'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('/auth/confirm_user', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'test_Password1@'}
    response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    #upload video to retrieve after re-encryption
    file = 'test_video.mp4'
    data = {
        'recipient': 'safemovnow@gmail.com',
        'file': (open(file, 'rb'), file)
    }
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))
    assert not 'error' in upload_response
    
    #change password
    change_password_object = {'new_password' : 'newPassword1@'}
    response = json.loads(client.post('bucket/change_password_reencrypt', data=change_password_object).data.decode('utf-8'))
    assert not 'error' in response
    
    #logout
    response = json.loads(client.get('/auth/logout').data.decode('utf-8'))
    assert 'success' in response  
    
    #Try logging in under new password
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'newPassword1@', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert not 'error' in response 
    
    # retrieve after re-encryption
    retrieve_video_post_object = {'video_name': upload_response['video_id']}
    retrieve_response = client.post('/bucket/retrieve', data=retrieve_video_post_object)
    with open(file, 'rb') as test_file:
        assert test_file.read() == retrieve_response.data


def test_set_verificationcode(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'test_Password1@', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('fakeusertest987@gmail.com',))[0]['verifyKey']
    post_object = {'input_code': f'{inputcode}', 'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('/auth/confirm_user', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    set_verificationcode_object = {'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('bucket/set_verificationcode', data=set_verificationcode_object).data.decode('utf-8'))
    assert not 'error' in response
    
def test_change_password_forgot(client):
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'test_Password1@', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('fakeusertest987@gmail.com',))[0]['verifyKey']
    post_object = {'input_code': f'{inputcode}', 'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('/auth/confirm_user', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    #upload video to not retireve after key zero'd
    file = 'test_video.mp4'
    data = {
        'recipient': post_object['email'],
        'file': (open(file, 'rb'), file)
    }
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))
    assert not 'error' in upload_response
    
    set_verificationcode_object = {'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('bucket/set_verificationcode', data=set_verificationcode_object).data.decode('utf-8'))

    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('fakeusertest987@gmail.com',))[0]['verifyKey']
    change_password_object = {'new_password' : 'newPassword1@', 'email': 'fakeusertest987@gmail.com', 'input_code': f'{inputcode}'}
    response = json.loads(client.post('/bucket/change_password_forgot', data = change_password_object).data.decode('utf-8'))
    assert not 'error' in response
    
    #Try logging in under new password
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'newPassword1@', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    #Fail to retrieve video
    retrieve_video_post_object = {'video_name': upload_response['video_id']}
    try:
        retrieve_response = client.post('/bucket/retrieve', data=retrieve_video_post_object)
        assert False
    except ValueError:
        assert True
        
    if __name__ == "__main__":
        app = flaskapp.create_app()
        app.config['TESTING'] = True

        test_change_password_reencrypt(app.test_client())
        test_set_verificationcode(app.test_client())
        test_change_password_forgot(app.test_client())
      