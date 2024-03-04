from flaskapp import create_app, socketio

app = create_app()

if __name__ == '__main__':
    # specified 'port=8080' to avoid some errors on default port
    #app.run(debug=True, port=8080)
    socketio.run(app, debug=True, port=8080)
