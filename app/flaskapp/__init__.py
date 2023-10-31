from flask import Flask, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import timedelta
from flask_session import Session

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    CORS(app, origins="http://localhost:3000", supports_credentials=True)
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
    app.config['SECRET_KEY'] = 'INSECURE_KEY_PLEASE_CHANGE_ME_BEFORE_ANYTHING_IMPORTANT'

    bcrypt.init_app(app)

    from .auth import auth
    CORS(auth, origins="http://localhost:3000", supports_credentials=True)

    app.register_blueprint(auth, url_prefix='/auth')

    return app