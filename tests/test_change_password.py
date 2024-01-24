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
    response = json.loads(client.post('bucket/change_password_reencrypt', data=change_password_object))
    assert response.status_code == 200
    
    current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=('testDeleteUser',))
    assert current_password == 'new_password'

def test_set_verificationcode(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'testDeleteUser','email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    
    set_verificationcode_object = {'email': 'fakeusertest987@gmail.com'}
    response = json.loads(client.post('bucket/set_verificationcode', data=set_verificationcode_object))
    assert response.status_code == 200 
    
def test_change_password_forgot(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'testDeleteUser','email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    change_password_object = {'new_password' : 'new_password', 'email': 'fakeusertest987@gmail.com', 'input_code': '123456'}
    response = client.post(('/bucket/change_password_forgot'), data = change_password_object)
    # assert response.status_code == 200
    
    current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=('testDeleteUser',))
    assert current_password == 'new_password'
    
if __name__ == "__main__":
    start_time = time.time()
    app = flaskapp.create_app()
    app.config['TESTING'] = True
    test_change_password_forgot(app.test_client())
    test_set_verificationcode()
    test_change_password_forgot()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")