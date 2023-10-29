from flask import Flask
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'INSECURE_KEY_PLEASE_CHANGE_ME_BEFORE_ANYTHING_IMPORTANT'
    bcrypt.init_app(app)

    from .auth import auth

    app.register_blueprint(auth, url_prefix='/auth')

    return app