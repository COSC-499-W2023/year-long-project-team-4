import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-reveal';
import { Container, Row, Col, Button, Form, Card, InputGroup, Spinner } from 'react-bootstrap';
import { viewSentVideoPath, uploadVideoPath, 
    IP_ADDRESS,
 } from '../Path';
import io from 'socket.io-client';
import Sidebar from './Sidebar';
import axios from 'axios';
import './MessagingPage.css';

function MessageSender({currentUser, setCurrentUser}) {
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [videoURL, setVideoURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Use the useLocation hook to access the location object
    const location = useLocation();
    const navigate = useNavigate();

    // Retreive video from location state
    const videoId = location.state?.videoId;

    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth'});
    };

    const socket = io(`${IP_ADDRESS}`,  {
        withCredentials: true,
        autoConnect: false
    });

    const UnixTimestampToReadableDate = (unixTimestamp) =>{
      const date = new Date(unixTimestamp * 1000);
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      const readableDate = date.toLocaleString('en-US', options);
      return <span>{readableDate}</span>;
    }

    useEffect(() => {
        // Auto-scroll to the bottom whenever messages change
        scrollToBottom();
    }, [chatMessages]);

    useEffect(() => {
      // Fetch current user on component mount
      const fetchCurrentUser = async () => {
          try {
              const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
                  withCredentials: true
              });

              if (response.data.email) {
                  setCurrentUser(response.data.email);
                  setIsAuthenticated(true);
              } else {
                  console.error('No user currently logged in');
                  setIsAuthenticated(false);
              }
              
          } catch (error) {
              navigate(uploadVideoPath);
              console.error('There was an error fetching the current user', error);
              setIsAuthenticated(false);
          }
      };

      fetchCurrentUser();
  }, []);

    // Fetch existing chat messages on component mount
    useEffect(() => {
        if (videoId) {
            socket.connect();
            setIsLoading(true);

            const formData = new FormData();
            formData.append('video_id', videoId);
        
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

            socket.emit('join_chat', { chat_name: videoId });
      
            socket.on('new_chat_message', (newMessage) => {
                console.log("New chat message");
                setChatMessages((prevMessages) => [...prevMessages, newMessage]);
            });

            socket.on('chat_history', (messages) => {
                console.log("Chat history");
                setChatMessages(messages);
            });

            // Clean up on component unmount
            return () => {
                socket.off('new_chat_message');
                socket.off('chat_history');
                socket.disconnect();
            };
        }
    }, []);

    //Navigate back to view videos
    const handleBack = () => {
        navigate(viewSentVideoPath);
    };

    // Display error if videoId is not available
    if (!videoId) {
        return (
            <div>
                <p>Video ID is required to join the chat.</p>
                <Button onClick={handleBack}>Go Back to Receive Video</Button>
            </div>
        );
    }

    //Handle form submission for sending a new message
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (message.trim()) {
            socket.connect();
            socket.emit('send_chat_message', { chat_name: videoId, message: message });
            setMessage(''); // Clear the input after sending
        } else {
            setErrorMessage('Please enter a message before sending.');
        }
    };
    return (
        <>
          <Container fluid className="container-fluid-custom">
            {/*<Row className="mt-3">
              <Col className="text-center">
                <Button variant="secondary" onClick={handleBack} style={{ margin: '20px' }}>Go Back to Videos</Button>
              </Col>
    </Row>*/}
            <Row noGutters={true}>
              {/* Video playback column (60% width) */}
              <Col md={{ span: 6, offset: 2 }} style={{ paddingRight: '15px' }}>
              <div className={isLoading ? "video-wrapper flex-center" : "video-wrapper"}>
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
              <Col md={4} style={{ paddingLeft: '15px' }}>
                <Card className="card-full-height" style={{ height: '84vh', display: 'flex', flexDirection: 'column' }}>
                  <Card.Header className="card-content-padding" style={{ padding: '10px 20px' }}>
                    <Card.Title>Messages</Card.Title>
                  </Card.Header>
                  <Card.Body className="message-area card-content-padding">
                    <div className='message-area-content'>
                      {chatMessages.map((chatMessage, index) => {
                          const isSentByCurrentUser = chatMessage.sender === currentUser;
                          return (
                            <div
                              key={index}
                              className={`message-bubble ${isSentByCurrentUser ? 'message-bubble-sent' : 'message-bubble-received'}`}
                            >
                              <div className="message-info">
                                <span className="message-sender"><strong>{chatMessage.sender}</strong></span>
                                {/*<span className="message-timestamp"><small>{new Date(chatMessage.timestamp).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</small></span>*/}
                                {console.log(chatMessage)}
                                <span className="message-timestamp"><small>{UnixTimestampToReadableDate(chatMessage.timestamp)}</small></span>
                              </div>
                              <div className="message-content">
                                <Card.Text>{chatMessage.message}</Card.Text>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div ref={messagesEndRef} />
                  </Card.Body>
                    <Form onSubmit={handleSubmit} className="input-group-custom">
                      <InputGroup>
                        <Form.Control
                          as="textarea"
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          style={{ marginRight: '10px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault(); 
                              handleSubmit(e); 
                            }
                          }}
                        />
                        <Button variant="primary" type="submit">Send</Button>
                      </InputGroup>
                    </Form>
                </Card>
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
