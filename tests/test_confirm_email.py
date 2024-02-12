import pytest
import time
import sys
import os
import json

sys.path.append(os.path.abspath('../app'))

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

def test_confirm_user(client):
    assert database.resetTable(tableName="userprofile")
    
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'Test_password@1', 'firstname': 'Beth', 'lastname': 'Chesman'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    print(response)
    assert not 'error' in response
    
    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=('fakeusertest987@gmail.com',))[0]['verifyKey']
    post_object = {'input_code': f'{inputcode}', 'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('/auth/confirm_user', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'Test_password@1'}
    response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
def test_password_failure(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'fakeusertest987@gmail.com', 'password': 'Test1', 'firstname': 'Beth'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert 'error' in response