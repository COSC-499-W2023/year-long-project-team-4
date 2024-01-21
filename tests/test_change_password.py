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
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response
    #Get user ID
    user_id = database.query_records(table_name='userprofile', fields='id', condition=f'email = %s', condition_values=("test123@example.com",))
    #Send and recieve videos from the user
    database.insert_video("TestDelete1.mp4","2022-01-22 11:59:00", user_id, "1","", True)
    s3Bucket.upload_file('This is test content', 'TestDelete1.mp4')
    database.insert_video("TestDelete2.mp4","2022-01-22 11:59:00", "1", user_id,"", True)
    s3Bucket.upload_file('This is test content', 'TestDelete2.mp4')
    #Run function
    response = json.loads(client.post('/change_password_reencrypt/"new_password"', data=post_object).data.decode('utf-8'))
    assert response.status_code == 200

    
def test_set_verificationcode_input():
    
    
def test_get_verificationcode_input():
    
    
def test_change_password_forgot():
    

if __name__ == "__main__":
    start_time = time.time()
    test_change_password_reencrypt()
    test_set_verificationcode_input()
    test_get_verificationcode_input()
    test_change_password_forgot()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")