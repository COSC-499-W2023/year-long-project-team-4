import os

from flask import Blueprint, request, session, jsonify, current_app
from rsa import generate_key

import database
from . import bcrypt

auth = Blueprint('auth', __name__)

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
    if password == '':
        return jsonify({'error': 'Password must be non-empty'}), 400
    if firstname is None:
        return jsonify({'error': 'Missing first name'}), 400
    if lastname is None:
        return jsonify({'error': 'Missing last name'}), 400

    # Ensure user doesn't already exist
    existing_user = database.query_records(table_name='userprofile', fields='email', condition=f'email = %s', condition_values=(email,))
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

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
