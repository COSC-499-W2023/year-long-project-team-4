import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, InputGroup, Spinner } from 'react-bootstrap';
import { receiveAndSendPath,
    IP_ADDRESS,
 } from '../Path';
import io from 'socket.io-client';
import axios from 'axios';

function MessageSender() {
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [videoURL, setVideoURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Use the useLocation hook to access the location object
    const location = useLocation();
    const navigate = useNavigate();

    // Retreive video from location state
    const videoName = location.state?.videoName;

    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const socket = io(`${IP_ADDRESS}`,  {
        withCredentials: true,
    });

    useEffect(() => {
        // Auto-scroll to the bottom whenever messages change
        scrollToBottom();
    }, [chatMessages]);

    // Fetch existing chat messages on component mount or when videoName changes
    useEffect(() => {
        if (videoName) {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('video_name', videoName);
        
            axios.post(`${IP_ADDRESS}/bucket/retrieve`, formData, {
                withCredentials: true,
                responseType: 'blob' // Sets the expected response type to 'blob' since a video file is binary data
            })
            .then(response => {
                const videoURL = URL.createObjectURL(response.data);
                setVideoURL(videoURL);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('There was an error retrieving the video!', error);
                setIsLoading(false);
            });

            socket.emit('join_chat', { chat_name: videoName });
      
            socket.on('new_chat_message', (newMessage) => {
                console.log("kinda working");
                setChatMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            socket.on('chat_history', (messages) => {
                setChatMessages(messages);

                /*const roomName = messages.find(message => message.sender !== currentUser);
                console.log(roomName['sender']);
                if (roomName && !chatRoomName) {
                    setChatRoomName(`${roomName['sender']}'s Room`);
                    console.log("hey")
                    console.log(chatRoomName);
                }*/
            });

            // Clean up on component unmount
            return () => {
                socket.off('new_chat_message');
                socket.off('chat_history');
            };
        }
    }, [videoName]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
          try {
            const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
              withCredentials: true
            });
      
            if (response.data.email) {
              setCurrentUser(response.data.email);
            } else {
              console.error('No user currently logged in');
            }
          } catch (error) {
            console.error('There was an error fetching the current user', error);
            setErrorMessage('There was an error fetching the current user');
          }
        };
      
        fetchCurrentUser();
      }, []);  

    //Navigate back to view videos
    const handleBack = () => {
        navigate(receiveAndSendPath);
    };

    // Display error if videoName is not available
    if (!videoName) {
        return (
            <div>
                <p>Video name is required to join the chat.</p>
                <Button onClick={handleBack}>Go Back to Receive Video</Button>
            </div>
        );
    }

    //Handle form submission for sending a new message
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (message.trim()) {
            socket.emit('send_chat_message', { chat_name: videoName, message: message });
            setMessage(''); // Clear the input after sending
        } else {
            setErrorMessage('Please enter a message before sending.');
        }
    };
    return (
        <>
          <Container fluid style={{ marginTop: '20px', padding: '0 20px' }}>
            <Row noGutters={true}>
              {/* Video playback column (60% width) */}
              <Col md={7} style={{ paddingRight: '15px' }}>
                <div className="video-wrapper" style={{ width: '100%', height: 'auto', padding: '10px', backgroundColor: '#f8f9fa' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spinner animation="border" role="status"/>
                        </div>
                    ) : videoURL ? (
                        <video src={videoURL} controls autoPlay style={{ width: '100%', height: 'auto' }} />
                    ) : (
                        <p>No video to display</p>
                    )}
                </div>
              </Col>
              {/* Messages column (40% width) */}
              <Col md={5} style={{ paddingLeft: '15px' }}>
                <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Card.Header style={{ padding: '10px 20px' }}>
                    <Card.Title>Messages</Card.Title>
                  </Card.Header>
                  <Card.Body style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 20px' }}>
                    {chatMessages.map((chatMessage, index) => (
                      <div key={index} className="mb-2">
                        <Card.Text>
                          <strong>{chatMessage.sender}</strong>
                          <small>{new Date(chatMessage.timestamp * 1000).toLocaleString()}</small>
                        </Card.Text>
                        <Card.Text>{chatMessage.message}</Card.Text>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </Card.Body>
                  <Card.Footer style={{ padding: '10px 20px' }}>
                    <Form onSubmit={handleSubmit}>
                      <InputGroup>
                        <Form.Control
                          as="textarea"
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          style={{ marginRight: '10px' }}
                        />
                        <Button variant="primary" type="submit">Send</Button>
                      </InputGroup>
                    </Form>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="text-center">
                <Button variant="secondary" onClick={handleBack} style={{ margin: '20px' }}>Go Back to Videos</Button>
              </Col>
            </Row>
            {errorMessage && (
              <Row className="mt-3">
                <Col>
                  <div className="alert alert-danger" style={{ margin: '20px' }}>{errorMessage}</div>
                </Col>
              </Row>
            )}
          </Container>
        </>
      );      
}

export default MessageSender;
