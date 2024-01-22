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
    #Create user
    database.insert_user('testDeleteUser','testDelete@example.com','test_password', "John", "Doe","","")
    #Send and recieve video from the user
    database.insert_video("TestDelete1.mp4","2022-01-22 11:59:00", "testDelete@example.com", "", "", "")
    s3Bucket.upload_file('This is test content', 'TestDelete1.mp4')
    database.insert_video("TestDelete2.mp4","2022-01-22 11:59:00", "", "testDelete@example.com", "", "")
    s3Bucket.upload_file('This is test content', 'TestDelete2.mp4')
    #Run function
    flaskapp.change_password_reencrypt("new_password")
    assert response.status_code == 200

def test_set_verificationcode():
    flaskapp.set_verification('testDelete@example.com')
    
def test_change_password_forgot():
    assert database.resetTable(tableName="userprofile", testcase=True)
    #Create user
    database.insert_user('testDeleteUser2','testDelete2@example.com','test_password', "Fake", "Doe","","")
    #Send and recieve video from the user
    database.insert_video("TestDelete3.mp4","2022-01-22 11:59:00", "testDelete2@example.com", "", "", "")
    s3Bucket.upload_file('This is test content', 'TestDelete3.mp4')
    database.insert_video("TestDelete4.mp4","2022-01-22 11:59:00", "", "testDelete2@example.com", "", "")
    s3Bucket.upload_file('This is test content', 'TestDelete4.mp4')
    #Run function
    flaskapp.change_password_forgot("testDelete@example.com", "new_password",)
    
if __name__ == "__main__":
    start_time = time.time()
    test_change_password_reencrypt()
    test_set_verificationcode()
    test_change_password_forgot()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")