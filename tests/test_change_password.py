import pytest
import time
import sys
import os
import json

sys.path.append(os.path.abspath('../app'))
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
    post_object = {'username': 'testDeleteUser','email': 'fakeuser987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    change_password_object = {'new_password' : 'new_password', 'email': 'fakeuser987@gmail.com', 'input_code': '123456'}
    response = json.loads(client.post('bucket/change_password_reencrypt', data=change_password_object).data.decode('utf-8'))
    assert not 'error' in response
    
    current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=('testDeleteUser',))[0]['password_hash']
    assert not 'test_password' in current_password 

def test_set_verificationcode(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'testDeleteUser','email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    set_verificationcode_object = {'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('bucket/set_verificationcode', data=set_verificationcode_object))
    assert not 'error' in response
    
def test_change_password_forgot(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'testDeleteUser','email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    input_code = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('fakeusertest987@gmail.com',))[0]['verifyKey']
    change_password_object = {'new_password' : 'new_password', 'email': 'fakeusertest987@gmail.com', 'input_code': '{input_code}'}
    response = json.loads(client.post('/bucket/change_password_forgot', data = change_password_object).data.decode('utf-8'))
    assert not 'error' in response
    
    current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=('testDeleteUser',))[0]['password_hash']
    assert not 'test_password' in current_password 
    
    post_object = {'username': 'testDeleteUser','email': 'fakeusertest987@gmail.com', 'password': 'new_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    