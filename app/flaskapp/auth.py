from flask import Blueprint, request, session, jsonify

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
    existing_user = database.query_records(table_name='userprofile', fields='email', condition=f'email = \'{email}\'')
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode()

    database.insert_user(username=username, email=email, password=hashed_password, firstname=firstname, lastname=lastname)

    session['username'] = username

    # Success code returns back the username logged in with
    return jsonify({'username': username}), 200


@auth.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    # Ensure request is valid
    if username is None:
        return jsonify({'error': 'Missing username'}), 400
    if password is None:
        return jsonify({'error': 'Missing password'}), 400

    existing_user_password = database.query_records(table_name='userprofile', fields='password_hash', condition=f'username = \'{username}\'')
    if not existing_user_password:
        return jsonify({'error': 'User not found under specified username'}), 404

    stored_hashed_password = existing_user_password[0]['password_hash']

    if not bcrypt.check_password_hash(stored_hashed_password, password):
        return jsonify({'error': 'Incorrect password'}), 401

    session['username'] = username

    return jsonify({'username': username}), 200


@auth.route('/logout')
def logout():
    session.pop('username', None)
    return 'Successful logout', 200
