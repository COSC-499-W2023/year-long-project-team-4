from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_socketio import SocketIO
import logging

bcrypt = Bcrypt()
socketio = SocketIO()

# Function to create and configure the Flask application
def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'INSECURE_KEY_PLEASE_CHANGE_ME_BEFORE_ANYTHING_IMPORTANT'

    # Adjust Flask logging to improve debugging
    logging.getLogger('werkzeug').setLevel(logging.ERROR)

    # Configure CORS to handle cross-origin requests
    CORS(app, origins="http://localhost:3000", supports_credentials=True)

    # Initialize Bcrypt for hashing passwords
    bcrypt.init_app(app)

    socketio.init_app(app, cors_allowed_origins="*")

    from .auth import auth
    from .bucket_interface import bucket
    from . import socket_events

    # Register the authentication blueprint
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(bucket, url_prefix='/bucket')

    return app
