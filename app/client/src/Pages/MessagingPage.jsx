import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, InputGroup } from 'react-bootstrap';
import { viewVideoPath,
    IP_ADDRESS,
 } from '../Path';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io(`${IP_ADDRESS}`,  {
    withCredentials: true,
  });

function MessageSender() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [sentMessage, setSentMessage] = useState('');
    const [serverResponse, setServerResponse] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);

    // Use the useLocation hook to access the location object
    const location = useLocation();
    const navigate = useNavigate();

    // Retreive video from location state
    const videoName = location.state?.videoName;

    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Auto-scroll to the bottom whenever messages change
        scrollToBottom();
    }, [chatMessages]);

    // Fetch existing chat messages on component mount or when videoName changes
    useEffect(() => {
        if (videoName) {

            socket.emit('join_chat', { chat_name: videoName });
      
            socket.on('new_chat_message', (newMessage) => {
                console.log("kinda working");
                setChatMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            socket.on('chat_history', (messages) => {
                setChatMessages(messages);
            });

            // Clean up on component unmount
            return () => {
                socket.off('new_chat_message');
                socket.off('chat_history');
            };
            /*const formData = new FormData();
            formData.append('video_name', videoName);

            axios.post(`${IP_ADDRESS}/bucket/retrieve_chat`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })
            .then(response => {
                console.log("checking");
                console.log(response.data);
                setChatMessages(response.data.messages);
            })
            .catch(error => {
                setErrorMessage(error.response?.data?.error || 'Error retrieving chat messages');
            });*/
        }
        // Listen for messages from the server
    /*socket.on('message', message => {
        setReceivedMessages(prevMessages => [...prevMessages, message]);
      });
  
      return () => {
        socket.off('message');
      };*/
    }, [videoName]);

    /*const sendMessage = () => {
        socket.emit('message', message);
        setMessage('');
      };*/

    //Navigate back to view videos
    const handleBack = () => {
        navigate(viewVideoPath);
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

        /*const formData = new FormData();
        formData.append('video_name', videoName);
        formData.append('chat_text', message);

        try {
            const response = await axios.post(`${IP_ADDRESS}/bucket/send_chat`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if (response.data.chat_id) {
                setSentMessage(`Message sent: ${message}`);
                setMessage('');
            } else {
                setErrorMessage('Error sending message');
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.error || 'Error sending chat message');
        }*/
    };
            return (<>
               {/* 
                <div style={{ color: 'white', padding: '20px' }}>
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <h1>Chat Room: {videoName}</h1>
        
                    <div className="chat-messages" style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                        {chatMessages.map((chatMessage, index) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '10px' }}>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>{chatMessage.sender}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{new Date(chatMessage.timestamp * 1000).toLocaleString()}</div>
                                <div style={{ marginTop: '5px', color: '#000' }}>{chatMessage.message}</div>
                            </div>
                        ))}
                    </div>
        
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="message">Message:</label>
                            <textarea 
                                id="message" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ width: '100%', padding: '10px', height: '100px' }} 
                            />
                        </div>
                        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>Send</button>
                    </form>
        
                    {sentMessage && (
                        <div style={{ marginTop: '10px', color: 'green' }}>
                            <h3>Sent Message:</h3>
                            <p>{sentMessage}</p>
                        </div>
                    )}
                </div>*/}
                <Container fluid style={{ marginTop: '20px' }}>
                <Row>
                    <Col md={{ span: 6, offset: 3 }}>
                    <Card>
                        <Card.Header>
                        <Card.Title>Chat Room: {videoName}</Card.Title>
                        </Card.Header>
                        <Card.Body style={{ height: '400px', overflowY: 'auto' }}>
                        {chatMessages.map((chatMessage, index) => (
                            <div key={index} className="mb-2">
                            <Card.Text>
                                <strong>{chatMessage.sender}</strong> <small>{new Date(chatMessage.timestamp * 1000).toLocaleString()}</small>
                            </Card.Text>
                            <Card.Text>{chatMessage.message}</Card.Text>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        </Card.Body>
                        <Card.Footer>
                        <Form onSubmit={handleSubmit}>
                            <InputGroup>
                            <Form.Control
                                as="textarea"
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <Button variant="primary" type="submit">Send</Button>
                            </InputGroup>
                        </Form>
                        </Card.Footer>
                    </Card>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col md={{ span: 6, offset: 3 }} className="text-center">
                    <Button variant="secondary" onClick={handleBack}>Go Back to Videos</Button>
                    </Col>
                </Row>
                {errorMessage && (
                    <Row className="mt-3">
                    <Col md={{ span: 6, offset: 3 }}>
                        <div className="alert alert-danger">{errorMessage}</div>
                    </Col>
                    </Row>
                )}
                </Container>
                </>
            );
}

export default MessageSender;
