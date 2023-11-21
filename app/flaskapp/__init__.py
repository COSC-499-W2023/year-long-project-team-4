from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import timedelta

bcrypt = Bcrypt()

# Function to create and configure the Flask application
def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'asdasdlkmpiianweoian'

    # Configure CORS to handle cross-origin requests
    CORS(app, origins="http://localhost:3000", supports_credentials=True)

    # Initialize Bcrypt for hashing passwords
    bcrypt.init_app(app)

    from .auth import auth

    # Register the authentication blueprint
    app.register_blueprint(auth, url_prefix='/auth')

    return app