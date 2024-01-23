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

def test_change_password_reencrypt():
    assert database.resetTable(tableName="userprofile", testcase=True)
    post_object = {'username': 'testDeleteUser','email': 'testDelete@example.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    response = client.post('/change_password_reencrypt/new_password', data=post_object)
    assert response.status_code == 200
    
    current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=('testDeleteUser',))
    assert current_password == 'new_password'

def test_set_verificationcode():
    post_object = {'username': 'fakeusertest987','email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = client.post('/set_verificationcode/fakeusertest987@gmail.com', data=post_object)
    assert response.status_code == 200 
    
def test_change_password_forgot():
    assert database.resetTable(tableName="userprofile", testcase=True)
    post_object = {'username': 'testDeleteUser','email': 'fakeusertest987@gmail.com', 'password': 'test_password', 'firstname': 'John', 'lastname': 'Doe'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    input_code = flaskapp.set_verificationcode('fakeusertest987@gmail.com')
    response = client.post('/change_password_forgot/fakeusertest987@gmail.com/new_password/'+ str(input_code))
    assert response.status_code == 200
    
    current_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=('fakeusertest987',))
    assert current_password == 'new_password'
    
    
if __name__ == "__main__":
    start_time = time.time()
    test_change_password_reencrypt()
    test_set_verificationcode()
    test_change_password_forgot()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")