import os

from flask import Blueprint, request, session, jsonify, current_app
from rsa import generate_key

import database
from . import bcrypt

auth = Blueprint('auth', __name__)

@auth.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    firstname = request.form.get('firstname')
    lastname = request.form.get('lastname')

    # Ensure request is valid
    if username is None:
        return jsonify({'error': 'Missing username'}), 400
    if email is None:
        return jsonify({'error': 'Missing email'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400
    if firstname is None:
        return jsonify({'error': 'Missing first name'}), 400
    if lastname is None:
        return jsonify({'error': 'Missing last name'}), 400

    # Ensure user doesn't already exist
    existing_user = database.query_records(table_name='userprofile', fields='username', condition=f'username = %s', condition_values=(username,))
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    salt_hash = os.urandom(64)
    private_key_seed = password + salt_hash.hex()
    private_key = generate_key(private_key_seed)
    public_key = private_key.publickey().export_key('PEM')

    hashed_password = bcrypt.generate_password_hash(password).decode()
    result = database.insert_user(username=username, email=email, password=hashed_password, firstname=firstname, lastname=lastname, salthash=salt_hash, pubKey=public_key)
    
    if result == 1:
        session['username'] = username
        session['email'] = email
        session['pkey_seed'] = password + salt_hash.hex()
        return jsonify({'username': username}), 200
    else:
        return jsonify({'error': 'Unknown error adding user'})


@auth.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    # Ensure request is valid
    if username is None:
        return jsonify({'error': 'Missing username'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400

    # Check username exists
    existing_user_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = %s', condition_values=(username,))
    if not existing_user_password:
        return jsonify({'error': 'User not found under specified username'}), 404

    # Check password is correct
    stored_hashed_password = existing_user_password[0]['password_hash']
    if not bcrypt.check_password_hash(stored_hashed_password, password):
        return jsonify({'error': 'Incorrect password'}), 401

    query_results = database.query_records(table_name='userprofile', fields='salthash, email', condition=f'username = %s', condition_values=(username,))[0]
    salt_hash = query_results['salthash']
    email = query_results['email']

    session['username'] = username
    session['email'] = email
    session['pkey_seed'] = password + salt_hash.hex()

    return jsonify({'username': username}), 200


@auth.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('pkey_seed', None)
    session.pop('email', None)
    return jsonify({'success': 'Successful logout'}), 200


@auth.route('/currentuser')
def get_current_user():
    if 'username' in session:
        return jsonify({'username': session['username']}), 200
    return jsonify({'error': 'No user currently logged in'}), 401
