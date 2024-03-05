import os
import boto3
import random
import string
import re
import jinja2

from flask import Blueprint, request, session, jsonify, current_app
from rsa import generate_key

import database
from . import bcrypt

auth = Blueprint('auth', __name__)

LOCAL = os.getenv("LOCAL") == 'True'

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
else:
    if not os.path.isdir('verificationCode'):
        os.mkdir('verificationCode')

@auth.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    password = request.form.get('password')
    firstname = request.form.get('firstname')
    lastname = request.form.get('lastname')
    
    # Ensure request is valid
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400
    if firstname is None:
        return jsonify({'error': 'Missing first name'}), 400
    if lastname is None:
        return jsonify({'error': 'Missing last name'}), 400
    if len(password) < 8:
        return jsonify({"error": "Password less than 8 characters"}), 502
    elif re.search('[0-9]',password) is None:
        return jsonify({"error": "Password has no numbers"}), 502
    elif re.search('[A-Z]',password) is None: 
        return jsonify({"error": "Password has no capital letters"}), 502
    specialchars = '@_!#$%^&*()<>?/\\|}{~:'
    howmany = 0
    for i in range(len(specialchars)):
        char = specialchars[i]
        if char in password:
            howmany += 1
    if howmany == 0:
            return jsonify({"error": "Password has no special characters"}), 502

    # Ensure user doesn't already exist
    existing_user = database.query_records(table_name='userprofile', fields='email', condition=f'email = %s', condition_values=(email,))
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409
    
    salt_hash = os.urandom(64)
    private_key_seed = password + salt_hash.hex()
    private_key = generate_key(private_key_seed)
    public_key = private_key.publickey().export_key('PEM')

    hashed_password = bcrypt.generate_password_hash(password).decode()

    #Create verification code
    created_code = ''.join(random.choices(string.digits, k=6))
    result = database.insert_user(email=email, password=hashed_password, firstname=firstname, lastname=lastname, salthash=salt_hash, pubKey=public_key, verifyKey=created_code, verifiedAcc='False')
    
    if result != 1:
        return jsonify({'error': 'Unknown error adding user'})
    
    #Save code locally if Local is true
    if LOCAL:
        obj_path = f"./verificationCode"
        completeName = os.path.join(obj_path, "code.txt")   
        file = open(completeName, "w")
        file.write(created_code)
        file.close()
        return jsonify({"status": "success", "message": "code saved locally"}), 200
    
    else:
        #Send user an email with code
        sender_email = 'safemovnow@gmail.com'
        # Compose the email message
        subject = "Confirm your account"
        html_body = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Safemov</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    text-align: center;
                }

                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }

                h1 {
                    color: #333;
                }

                p {
                    color: #666;
                }

                .verification-code {
                    font-size: 24px;
                    font-weight: bold;
                    color: #3498db;
                }

                .footer {
                    margin-top: 20px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to Safemov, {{firstname}}!</h1>
                <p>Thank you for signing up. We're excited to have you on board.</p>
                <p>Your verification code is: <span class="verification-code">{{created_code}}</span></p>
                <p>Please use this code to confirm your email address and complete the registration process.</p>
                <div class="footer">
                    <p>Best regards,<br> The Safemov Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        formatted = jinja2.Template(html_body).render(firstname = firstname, created_code = created_code)
        
        try:
            # Send the email
            email = ses_client.send_email(
                Source=sender_email,
                Destination={'ToAddresses': [email]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {'Html': {'Data': formatted}}
                }
            )

            print(f"Email sent to {email}.")
            return jsonify({"status": "success", "message": "email sent"}), 200
        except Exception as e:
            print(f"Error sending email: {e}")
            return jsonify({"error": "Failed to send verification code via email"}), 502

@auth.route('/confirm_user', methods=['POST'])
def confirm_user():
    input_code = request.form.get('input_code')
    email = request.form.get('email')
    # Ensure request is valid
    if input_code is None:
        return jsonify({'error': 'Missing input code'}), 400
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    
    created_code = database.query_records(table_name='userprofile', fields='verifyKey', condition=f'email = %s', condition_values=(email,))[0]['verifyKey']
    
    # Check if input code is same as emailed
    if input_code == created_code:
        # Set verified to True
        result = database.update_user(user_email = email, new_verifiedAcc = 'True')
        
        if result == 1:
            return jsonify({'status': 'success', 'message': 'Email verified'}), 200
        else:
            return jsonify({'error': 'Unknown error verifying email'})
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
    
    # Check email verified
    email_verified = database.query_records(table_name='userprofile', fields='verifiedAcc', condition=f'email = %s', condition_values=(email,))[0]
    if not email_verified['verifiedAcc']:
        return jsonify({'error': 'User email is not verified'}), 404

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


@auth.route('/updateinfo', methods=['POST'])
def update_user_info():
    if 'email' in session:
        new_email = request.form.get('email')
        if new_email == '':
            new_email = None
        firstname = request.form.get('firstname')
        if firstname == '':
            firstname = None
        lastname = request.form.get('lastname')
        if lastname == '':
            lastname = None

        result = database.update_user(session['email'], new_email=new_email, new_fname=firstname, new_lname=lastname)
        if result == -1:
            return jsonify({'error': 'Unknown error changing user info'}), 401

        if new_email is not None:
            session['email'] = new_email

        return jsonify({'email': session['email']}), 200

    return jsonify({'error': 'No user currently logged in'}), 401


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
