from flask import Blueprint, request

import database

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    result = database.query_records(table_name='userprofile', fields='email')

    return f'{result}'


