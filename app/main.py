from flaskapp import create_app
from flask_session import Session

app = create_app()
sess = Session()
app.config['SECRET_KEY'] = 'asdasdlkmpiianweoian'
app.config['SESSION_TYPE'] = 'filesystem'

if __name__ == '__main__':
    sess.init_app(app)

    app.run(debug=True, port=8080)