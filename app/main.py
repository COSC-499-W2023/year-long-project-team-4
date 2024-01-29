from flaskapp import create_app
from flaskapp import create_app, socketio

app = create_app()

#@socketio.on('test_event')
#def handle_test_event(data):
#    print("Received test_event:", data)
#    socketio.emit('test_response', {'message': 'Checking if event received!'})

if __name__ == '__main__':
    # specified 'port=8080' to avoid some errors on default port
    app.run(debug=True, port=8080)
    #socketio.run(app, debug=True, port=8080)
