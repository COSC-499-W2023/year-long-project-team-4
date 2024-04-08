import pytest
import sys
import os
import json
from base64 import b64encode, b64decode
sys.path.append(os.path.abspath('../app'))
sys.path.append(os.path.abspath('../app/flaskapp'))

from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
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

def aes_encrypt_video(data, aes256_key=None):
    if aes256_key is None:
        aes256_key = Random.get_random_bytes(32)
    cipher = AES.new(aes256_key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    result_json = {
        'nonce': b64encode(cipher.nonce).decode('utf-8'),
        'ciphertext': b64encode(ciphertext).decode('utf-8'),
        'tag': b64encode(tag).decode('utf-8')
    }
    return json.dumps(result_json), aes256_key

def aes_decrypt_video(data_json, aes256_key):
    b64 = json.loads(data_json)
    nonce = b64decode(b64['nonce'])
    ciphertext = b64decode(b64['ciphertext'])
    tag = b64decode(b64['tag'])

    cipher = AES.new(aes256_key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext

def rsa_encrypt_aes256_key(aes256_key, rsa_public_key):
    cipher = PKCS1_v1_5.new(rsa_public_key)
    cipher_text = cipher.encrypt(aes256_key)
    return b64encode(cipher_text)

def rsa_decrypt_aes256_key(encrypted_aes256_key, rsa_private_key):
    decipher = PKCS1_v1_5.new(rsa_private_key)
    aes256_key = decipher.decrypt(b64decode(encrypted_aes256_key), None)
    return aes256_key


# Test that you can reconsctruct the private key that generates a user's public key
def test_reconstruct_private_key(client):
    # Reset database and signup
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],))[0]

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
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],))[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']
    public_key = RSA.import_key(publickey_import_string)

    # Reconstruct the private key from the password and stored salthash
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex()
    private_key = generate_key(private_key_seed)

    # Generate AES key, encrypt it, decrypt it, check output matches initial key
    aes256_key = Random.get_random_bytes(32)
    encrypted_aes_key = rsa_encrypt_aes256_key(aes256_key, public_key)
    decrypted_aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, private_key)
    assert aes256_key == decrypted_aes_key

# Encrypt an AES key then try to decrypt it with the wrong private key
def test_encrypt_decrypt_key_fail(client):
    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],))[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']
    public_key = RSA.import_key(publickey_import_string)

    # Reconstruct the private key from the password and stored salthash, but add extra data to make the seed incorrect
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex() + 'extra'
    private_key = generate_key(private_key_seed)

    # Generate AES key, encrypt it, decrypt it, check output does not match initial key
    aes256_key = Random.get_random_bytes(32)
    encrypted_aes_key = rsa_encrypt_aes256_key(aes256_key, public_key)

    # Invalid key decryption is allowed to fail in 2 ways
    # In some cases the key is able to complete the decryption algorithm, but gives a value different than our original input
    # In other cases, the key won't work to decrypt the data at all, and throws ValueError
    # Both of these are okay
    try:
        decrypted_aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, private_key)
        assert aes256_key != decrypted_aes_key
    except ValueError:
        pass

# Encrypt a message then decrypt it with correct AES key
def test_encrypt_decrypt_message_success(client):
    test_message = Random.get_random_bytes(512)
    encrypted_message, aes_key = aes_encrypt_video(test_message)
    decrypted_message = aes_decrypt_video(encrypted_message, aes_key)
    assert test_message == decrypted_message

# Encrypt a video file then try to decrypt it with the wrong AES key
def test_encrypt_decrypt_message_fail(client):
    test_message = Random.get_random_bytes(512)
    encrypted_message, aes_key = aes_encrypt_video(test_message)

    # Generate new AES key that we will attempt to use
    wrong_key = Random.get_random_bytes(32)

    # We should expect a ValueError when using the wrong key
    try:
        decrypted_message = aes_decrypt_video(encrypted_message, wrong_key)
        assert False
    except ValueError:
        assert True

# Encrypt a message, then encrypt the AES key, then decrypt the AES key, then decrypt the message
def test_end_to_end(client):
    test_message = Random.get_random_bytes(512)

    assert database.resetTable(tableName="userprofile")
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    # Get public key and salt hash
    query_response = database.query_records(table_name='userprofile', fields='publickey, salthash', condition=f'email = %s', condition_values=(post_object['email'],))[0]

    # This is the public key stored in the database
    publickey_import_string = query_response['publickey']
    public_key = RSA.import_key(publickey_import_string)

    # Reconstruct the private key from the password and stored salthash
    salthash = query_response['salthash']
    private_key_seed = post_object['password'] + salthash.hex()
    private_key = generate_key(private_key_seed)

    # Encrypt our message
    encrypted_message, aes_key = aes_encrypt_video(test_message)

    # Encrypt then decrypt the AES key
    encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, public_key)
    decrypted_aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, private_key)

    # Use decrypted AES key to decrypt message
    decrypted_message = aes_decrypt_video(encrypted_message, decrypted_aes_key)

    # Compare decrypted message to input
    assert test_message == decrypted_message

# Create an account, upload a video to self, retrieve the video, compare to original
def test_video_upload_download(client):
    # Setup some test data
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data = {
        'recipient': post_object['email'],
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=(post_object['email'],))[0]['verifyKey']
    post_object2 = {'input_code': f'{inputcode}', 'email': post_object['email']}
    response = json.loads(client.post('/auth/confirm_user', data=post_object2).data.decode('utf-8'))
    assert not 'error' in response

    login_response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert login_response.get('email') == post_object['email'] # Ensure we are now logged in

    # Upload our test video
    upload_response = json.loads(client.post('/bucket/upload', data=data).data.decode('utf-8'))

    # Retrieve the video
    retrieve_video_post_object = {'video_id': upload_response['video_id']}
    retrieve_response = client.post('/bucket/retrieve', data=retrieve_video_post_object)

    # Check that retrieved video matches test file
    with open(file, 'rb') as test_file:
        assert test_file.read() == retrieve_response.data

def test_video_tags(client):
    # Setup some test data
    post_object = {'username': 'test123','email': 'test123@example.com', 'password': 'Test_password1!', 'firstname': 'Test', 'lastname': 'LastName'}
    file = 'test_video.mp4'
    data_tags = {
        'recipient': post_object['email'],
        'file': (open(file, 'rb'), file),
        'json': (open('test_json.json', 'rb'), 'test_json.json')
    }
    data_tagless = {
        'recipient': post_object['email'],
        'file': (open(file, 'rb'), file)
    }

    # Reset tables and signup
    assert database.resetTable(tableName="userprofile")
    assert database.resetTable(tableName="videos")
    response = json.loads(client.post('/auth/signup', data=post_object).data.decode('utf-8'))
    assert not 'error' in response

    inputcode = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=(post_object['email'],))[0]['verifyKey']
    post_object2 = {'input_code': f'{inputcode}', 'email': post_object['email']}
    response = json.loads(client.post('/auth/confirm_user', data=post_object2).data.decode('utf-8'))
    assert not 'error' in response

    login_response = json.loads(client.post('/auth/login', data=post_object).data.decode('utf-8'))
    assert login_response.get('email') == post_object['email'] # Ensure we are now logged in

    # Upload our test video with the tags ['one', 'two']
    upload_response = json.loads(client.post('/bucket/upload', data=data_tags).data.decode('utf-8'))
    assert not 'error' in upload_response

    # Upload our test video without tags
    upload_response = json.loads(client.post('/bucket/upload', data=data_tagless).data.decode('utf-8'))
    assert not 'error' in upload_response


    # There should now be 2 videos returned
    get_videos_response = json.loads(client.get('/bucket/getvideos').data.decode('utf-8'))
    assert len(get_videos_response) == 2

    get_sent_videos_response = json.loads(client.get('/bucket/get_sent_videos').data.decode('utf-8'))
    assert len(get_sent_videos_response) == 2

    assert get_videos_response == get_sent_videos_response

    first_video_tags = get_videos_response[0]['tags']
    second_video_tags = get_videos_response[1]['tags']

    assert first_video_tags == ['one', 'two'] or second_video_tags == ['one', 'two']
    assert first_video_tags == [] or second_video_tags == []
