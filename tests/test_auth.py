import pytest
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


# Test that user can sign up
def test_signup_success(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}

    session_email_pre_signup = json.loads(client.get('/auth/currentuser').data.decode('utf-8'))
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    session_email_post_signup = json.loads(client.get('/auth/currentuser').data.decode('utf-8'))
    
    assert 'error' in session_email_pre_signup       # No user should be logged in beforehand
    assert 'email' in session_email_post_signup      # Signup should be successful
    assert 'email' in response                       # User should be logged in after signup

# Test that signing up with a email that already exists will cause an error
def test_signup_fail(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}

    response_first = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert 'email' in response_first                 # Signup should be successful
    
    response_second = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert 'error' in response_second                   # User already exists and should give error

# Creates account, logs out, then tests that the account can be logged into
def test_login_success(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}

    client.post('/auth/signup', data=post_object)
    client.get('/auth/logout')
    current_user = json.loads(client.get('/auth/currentuser').data.decode('utf-8'))
    assert 'error' in current_user # Ensure we are not currently logged in

    login_response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert login_response.get('email') == post_object['email'] # Ensure we are now logged in

# Attempt to login with invalid credentials, ensure it fails
def test_login_fail(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}

    current_user = json.loads(client.get('/auth/currentuser').data.decode('utf-8'))
    assert 'error' in current_user # Ensure we are not currently logged in

    login_response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert 'error' in login_response # Ensure we are not logged in since user does not exist

    current_user = json.loads(client.get('/auth/currentuser').data.decode('utf-8'))
    assert 'error' in current_user # Ensure we are not currently logged in

def test_logout(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}

    client.post('/auth/signup', data=post_object)

    response = json.loads(client.get('/auth/logout').data.decode('utf-8'))
    assert 'success' in response

    current_user = json.loads(client.get('/auth/currentuser').data.decode('utf-8'))
    assert 'error' in current_user # Ensure we are not currently logged in

def test_get_user_details(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}

    client.post('/auth/signup', data=post_object)
    response = json.loads(client.get('/auth/userdetails').data.decode('utf-8'))

    assert response['email'] == post_object['email']
    assert response['firstname'] == post_object['firstname']
    assert response['lastname'] == post_object['lastname']

def test_change_user_details(client):
    assert database.resetTable(tableName="userprofile")

    signup_post_object = {'email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    update_post_object = {'email': 'newemail@example.com','firstname': 'New', 'lastname': 'Name'}

    client.post('/auth/signup', data=signup_post_object)

    client.post('/auth/updateinfo', data=update_post_object)
    response = json.loads(client.get('/auth/userdetails').data.decode('utf-8'))

    # Check that user details properly changed
    assert response['email'] == update_post_object['email']
    assert response['firstname'] == update_post_object['firstname']
    assert response['lastname'] == update_post_object['lastname']
