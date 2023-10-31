from flask import Blueprint, request, session, jsonify, make_response

import database
from . import bcrypt

auth = Blueprint('auth', __name__)

#@auth.route('/new_cookie')
#def new_cookie():
    #response = make_response("Hello World")
    #response.set_cookie("mycookie", "myvalue")
    #return response

#@auth.route('/show_cookie')
#def show_cookie():
    #cookie_value = request.cookies.get("mycookie")
    #return cookie_value


#@auth.route('/set-test-session')
#def set_test_session():
    #session['test'] = 'hello'
    #return "Test session set!"

#@auth.route('/get-test-session')
#def get_test_session():
    #print(session)
    #return session.get('test', 'No session value set')

@auth.route('/checking', methods=['GET'])
def message():
    return jsonify({
        'message': "Hello World"
    })

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

    hashed_password = bcrypt.generate_password_hash(password).decode()
    result = database.insert_user(username=username, email=email, password=hashed_password, firstname=firstname, lastname=lastname)
    if result == 1:
        session['username'] = username
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

    #session['username'] = username
    #print("login:")
    #print(session)
    #return jsonify({'username': username}), 200

    response = make_response(jsonify({'username': username}), 200)
    response.set_cookie("username_cookie", username)  # Store username in the cookie
    return response


@auth.route('/logout')
def logout():
    #session.pop('username', None)
    #return jsonify({'success': 'Successful logout'}), 200

    response = make_response(jsonify({'success': 'Successful logout'}), 200)
    response.delete_cookie("username_cookie")
    return response


@auth.route('/currentuser')
def get_current_user():
    #if 'username' in session:
    #    return jsonify({'username': session['username']}), 200
    #return jsonify({'error': 'No user currently logged in'}), 401

    username = request.cookies.get("username_cookie")
    if username:
        return jsonify({'username': username}), 200
    return jsonify({'error': 'No user currently logged in'}), 401