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


# Test that you can reconsctruct the private key that generates a user's public key
def test_reconstruct_private_key(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    assert False

# Encrypt an AES key then decrypt it with correct private key
def test_encrypt_decrypt_key_success(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    assert False

# Encrypt an AES key then try to decrypt it with the wrong private key
def test_encrypt_decrypt_key_fail(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    assert False

# Encrypt a video file then decrypt it with correct AES key
def test_encrypt_decrypt_video_success(client):
    assert False

# Encrypt a video file then try to decrypt it with the wrong AES key
def test_encrypt_decrypt_video_fail(client):
    assert False

# Encrypt a video, then encrypt the AES key, then decrypt the AES key, then decrypt the video
def test_end_to_end(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    assert False

# Create an account, upload a video to self, retrieve the video, compare to original
def test_video_upload_download(client):
    assert database.resetTable(tableName="userprofile", testcase=True)
    assert database.resetTable(tableName="videos", testcase=True)
    assert False


if __name__ == '__main__':
    app = flaskapp.create_app()
    app.config['TESTING'] = True
