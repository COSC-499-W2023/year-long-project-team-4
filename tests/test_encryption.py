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


# Test that you can reconsctruct the private key that generates a user's public key
def test_reconstruct_private_key(client):
    # Reset database and signup
    assert database.resetTable(tableName="userprofile", testcase=True)
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],), testcase=True)[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']

    # Reconstruct the private key from the password and stored salthash
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex()
    private_key = generate_key(private_key_seed)

    # Generate a public key from the reconstructed private key
    generated_public_key = private_key.publickey().export_key('PEM')

    # Ensure that the created public key matches the stored public key
    assert publickey_import_string == generated_public_key.decode('utf-8')

# Encrypt an AES key then decrypt it with correct private key
def test_encrypt_decrypt_key_success(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],), testcase=True)[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']
    public_key = RSA.import_key(publickey_import_string)

    # Reconstruct the private key from the password and stored salthash
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex()
    private_key = generate_key(private_key_seed)

    # Generate AES key, encrypt it, decrypt it, check output matches initial key
    aes256_key = Random.get_random_bytes(32)
    encrypted_aes_key = flaskapp.rsa_encrypt_aes256_key(aes256_key, public_key)
    decrypted_aes_key = flaskapp.rsa_decrypt_aes256_key(encrypted_aes_key, private_key)
    assert aes256_key == decrypted_aes_key

# Encrypt an AES key then try to decrypt it with the wrong private key
def test_encrypt_decrypt_key_fail(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],), testcase=True)[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']
    public_key = RSA.import_key(publickey_import_string)

    # Reconstruct the private key from the password and stored salthash, but add extra data to make the seed incorrect
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex() + 'extra'
    private_key = generate_key(private_key_seed)

    # Generate AES key, encrypt it, decrypt it, check output does not match initial key
    aes256_key = Random.get_random_bytes(32)
    encrypted_aes_key = flaskapp.rsa_encrypt_aes256_key(aes256_key, public_key)
    decrypted_aes_key = flaskapp.rsa_decrypt_aes256_key(encrypted_aes_key, private_key)
    assert aes256_key != decrypted_aes_key

# Encrypt a message then decrypt it with correct AES key
def test_encrypt_decrypt_message_success(client):
    test_message = Random.get_random_bytes(512)
    encrypted_message, aes_key = flaskapp.aes_encrypt_video(test_message)
    decrypted_message = flaskapp.aes_decrypt_video(encrypted_message, aes_key)
    assert test_message == decrypted_message

# Encrypt a video file then try to decrypt it with the wrong AES key
def test_encrypt_decrypt_message_fail(client):
    test_message = Random.get_random_bytes(512)
    encrypted_message, aes_key = flaskapp.aes_encrypt_video(test_message)

    # Generate new AES key that we will attempt to use
    wrong_key = Random.get_random_bytes(32)

    # We should expect a ValueError when using the wrong key
    try:
        decrypted_message = flaskapp.aes_decrypt_video(encrypted_message, wrong_key)
        assert False
    except ValueError:
        assert True

# Encrypt a message, then encrypt the AES key, then decrypt the AES key, then decrypt the message
def test_end_to_end(client):
    test_message = Random.get_random_bytes(512)

    assert database.resetTable(tableName="userprofile", testcase=True)
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],), testcase=True)[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']
    public_key = RSA.import_key(publickey_import_string)

    # Reconstruct the private key from the password and stored salthash
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex()
    private_key = generate_key(private_key_seed)

    # Encrypt our message
    encrypted_message, aes_key = flaskapp.aes_encrypt_video(test_message)

    # Encrypt then decrypt the AES key
    encrypted_aes_key = flaskapp.rsa_encrypt_aes256_key(aes_key, public_key)
    decrypted_aes_key = flaskapp.rsa_decrypt_aes256_key(encrypted_aes_key, private_key)

    # Use decrypted AES key to decrypt message
    decrypted_message = flaskapp.aes_decrypt_video(encrypted_message, decrypted_aes_key)

    # Compare decrypted message to input
    assert test_message == decrypted_message

# Create an account, upload a video to self, retrieve the video, compare to original
def test_video_upload_download(client):
    # Setup some test data
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'test_password', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data = {
        'recipient': post_object['email'],
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile", testcase=True)
    assert database.resetTable(tableName="videos", testcase=True)
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Upload our test video
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))

    # Retrieve the video
    retrieve_video_post_object = {'video_name': upload_response['video_id']}
    retrieve_response = client.post('/bucket/regtrieve', data=retrieve_video_post_object)

    # Check that retrieved video matches test file
    with open(file, 'rb') as test_file:
        assert test_file.read() == retrieve_response.data
