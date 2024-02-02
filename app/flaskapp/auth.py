import os
import boto3
import random
import string
import re

from flask import Blueprint, request, session, jsonify, current_app
from rsa import generate_key

import database
from . import bcrypt

auth = Blueprint('auth', __name__)

LOCAL = os.getenv('LOCAL') == 'True'

if not LOCAL:
    ACCESS_KEY = os.getenv("ACCESSKEY")
    SECRET_KEY = os.getenv('SECRETKEY')
    SESSION_TOKEN = os.getenv('SESSTOKEN')
    ses_client = boto3.client(
    'ses', 
    region_name='ca-central-1',
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    aws_session_token=SESSION_TOKEN
    )
    boto3.setup_default_session(profile_name='team4-dev')
else:
    if not os.path.isdir('verificationCode'):
        os.mkdir('verificationCode')

@auth.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    password = request.form.get('password')
    # Ensure request is valid
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400
    specialCharacters = set('$#@!*')
    if len(password) < 8:
        return jsonify({"error": "Password less than 8 characters"}), 502
    elif re.search('[0-9]',password) is None:
        return jsonify({"error": "Password has no numbers"}), 502
    elif re.search('[A-Z]',password) is None: 
        return jsonify({"error": "Password has no capital letters"}), 502
    elif re.search(specialCharacters,password) is None: 
        return jsonify({"error": "Password has no special characters"}), 502

    # Ensure user doesn't already exist
    existing_user = database.query_records(table_name='userprofile', fields='email', condition=f'email = %s', condition_values=(email,))
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    #Create verification code
    created_code = ''.join(random.choices(string.digits, k=6))
    database.update_user(email,new_verifyKey = created_code)
    #Save code locally if Local is true
    if LOCAL:
        obj_path = f"./verificationCode"
        completeName = os.path.join(obj_path, "code.txt")   
        file = open(completeName, "w")
        file.write(created_code)
        file.close()
        return jsonify({"status": "success", "message": "code saved locally"}), 200
    #Send user an email with code
    try:
        response = ses_client.send_email(
            Source='safemovnow@gmail.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Password Change Verification Code'},
                'Body': {'Text': {'Data': f'Your verification code is: {created_code}'}}
            }
        )
        return jsonify({"status": "success", "message": "email sent"}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"error": "Failed to send verification code via email"}), 502

@auth.route('/confirm_user', methods=['POST'])
def confirm_user():
    input_code = request.form.get('input_code')
    email = request.form.get('email')
    password = request.form.get('password')
    firstname = request.form.get('firstname')
    lastname = request.form.get('lastname')
    # Ensure request is valid
    if input_code is None:
        return jsonify({'error': 'Missing input code'}), 400
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400
    if firstname is None:
        return jsonify({'error': 'Missing first name'}), 400
    if lastname is None:
        return jsonify({'error': 'Missing last name'}), 400
    
    created_code = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=(email,))[0]['verifyKey']
    
    if input_code == created_code:
        salt_hash = os.urandom(64)
        private_key_seed = password + salt_hash.hex()
        private_key = generate_key(private_key_seed)
        public_key = private_key.publickey().export_key('PEM')

        hashed_password = bcrypt.generate_password_hash(password).decode()
        
        result = database.insert_user(email=email, password=hashed_password, firstname=firstname, lastname=lastname, salthash=salt_hash, pubKey=public_key)
    
        if result == 1:
            session['email'] = email
            session['pkey_seed'] = password + salt_hash.hex()
            return jsonify({'email': email}), 200
        else:
            return jsonify({'error': 'Unknown error adding user'})
    elif input_code != created_code:
        return (jsonify({"status": "error", "message": "codes do not match"}),502)
    else:
        return (jsonify({"status": "error", "message": "code not found"}), 502)
    
@auth.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    # Ensure request is valid
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400

    # Check email exists
    existing_user_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'email = %s', condition_values=(email,))
    if not existing_user_password:
        return jsonify({'error': 'User not found under specified email'}), 404

    # Check password is correct
    stored_hashed_password = existing_user_password[0]['password_hash']
    if not bcrypt.check_password_hash(stored_hashed_password, password):
        return jsonify({'error': 'Incorrect password'}), 401

    query_results = database.query_records(table_name='userprofile', fields='salthash, email', condition=f'email = %s', condition_values=(email,))[0]
    salt_hash = query_results['salthash']
    email = query_results['email']

    session['email'] = email
    session['pkey_seed'] = password + salt_hash.hex()

    return jsonify({'email': email}), 200


@auth.route('/logout')
def logout():
    session.pop('pkey_seed', None)
    session.pop('email', None)
    return jsonify({'success': 'Successful logout'}), 200


@auth.route('/currentuser')
def get_current_user():
    if 'email' in session:
        return jsonify({'email': session['email']}), 200
    return jsonify({'error': 'No user currently logged in'}), 401


@auth.route('/userdetails')
def get_user_details():
    if 'email' in session:
        email = session['email']
        query_results = database.query_records(table_name='userprofile', fields='firstname, lastname', condition=f'email = %s', condition_values=(email,))[0]
        firstname = query_results['firstname']
        lastname = query_results['lastname']
        return jsonify({'firstname': firstname, 'lastname': lastname, 'email': email}), 200
    return jsonify({'error': 'No user currently logged in'}), 401