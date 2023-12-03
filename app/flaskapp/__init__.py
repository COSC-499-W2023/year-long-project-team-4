from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from .bucket_interface import rsa_encrypt_aes256_key, rsa_decrypt_aes256_key, aes_encrypt_video, aes_decrypt_video

bcrypt = Bcrypt()

# Function to create and configure the Flask application
def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'INSECURE_KEY_PLEASE_CHANGE_ME_BEFORE_ANYTHING_IMPORTANT'

    # Configure CORS to handle cross-origin requests
    CORS(app, origins="http://localhost:3000", supports_credentials=True)

    # Initialize Bcrypt for hashing passwords
    bcrypt.init_app(app)

    from .auth import auth
    from .bucket_interface import bucket

    # Register the authentication blueprint
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(bucket, url_prefix='/bucket')

    return app