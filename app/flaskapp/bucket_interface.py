import os
import json
from base64 import b64encode, b64decode

from flask import Blueprint, request, session, jsonify, current_app
from Crypto import Random
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA

import s3Bucket
import database

bucket = Blueprint('bucket', __name__)

def aes_encrypt_video(data):
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
    return plaintext.decode('utf-8')

def rsa_encrypt_aes256_key(aes256_key, rsa_public_key):
    cipher = PKCS1_v1_5.new(rsa_public_key)
    cipher_text = cipher.encrypt(aes256_key)
    return cipher_text

def rsa_decrypt_aes256_key(encrypted_aes256_key, rsa_private_key):
    decipher = PKCS1_v1_5.new(rsa_private_key)
    aes256_key = decipher.decrypt(encrypted_aes256_key, None)
    return aes256_key

@bucket.route('/upload', methods=['POST'])
def upload_video():
    pass


if __name__ == '__main__':
    # our RSA private and public keys
    rsa_private_key = RSA.generate(2048)
    rsa_public_key = rsa_private_key.public_key()

    # msg is our video
    msg = b'this is my message'

    # encrypt our video
    msg_json, aes_key = aes_encrypt_video(msg)

    # encrypt the AES key used to encrypt the video using our RSA public key
    encrypted_aes_key = rsa_encrypt_aes256_key(aes_key, rsa_public_key)

    # this is where we would stop after an upload operation. save the encrypted key with the video DB entry

    # start of decryption / view video process

    # decrypt the AES key using our RSA private key
    decrypted_aes_key = rsa_decrypt_aes256_key(encrypted_aes_key, rsa_private_key)
    decrypted_msg = aes_decrypt_video(msg_json, decrypted_aes_key)

    # note our decrypted message matches the message defined at the top
    print(decrypted_msg)
