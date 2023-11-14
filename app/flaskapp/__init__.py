from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import timedelta

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    CORS(app, origins="http://localhost:3000", supports_credentials=True)

    bcrypt.init_app(app)

    from .auth import auth
    CORS(auth, origins="http://localhost:3000", supports_credentials=True)

    app.register_blueprint(auth, url_prefix='/auth')

    return app