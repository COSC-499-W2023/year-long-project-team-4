import React, { useState, useEffect } from 'react';
import io, {Socket} from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { viewVideoPath } from '../Path';
import axios from 'axios';


function MessageSender() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [sentMessage, setSentMessage] = useState('');
    const [serverResponse, setServerResponse] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    // Use the useLocation hook to access the location object
    const location = useLocation();
    const navigate = useNavigate();

    //const socket = io('http://localhost:8080');

    /*const handleSubmit = (e) => {
        e.preventDefault();
        // Update the state with the new message
        setSentMessage(`${name}: ${message}`);
        // Clear the form fields
        setName('');
        setMessage('');
    };*/

    // Access the videoName from the location state
    const videoName = location.state?.videoName;
    console.log(videoName);

    useEffect(() => {
        if (videoName) {
            // Retrieve the existing chat messages
            const formData = new FormData();
            formData.append('video_name', videoName);

            axios.post('http://localhost:8080/bucket/retrieve_chat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })
            .then(response => {
                // Set the retrieved chat messages to state
                console.log("checking");
                console.log(response.data);
                setChatMessages(response.data.messages); // Assuming response.data contains chat messages
            })
            .catch(error => {
                setErrorMessage(error.response?.data?.error || 'Error retrieving chat messages');
            });
        }
    }, [videoName]);

    const handleBack = () => {
        navigate(viewVideoPath);
    };

    if (!videoName) {
        return (
            <div>
                <p>Video name is required to join the chat.</p>
                <Button onClick={handleBack}>Go Back to Receive Video</Button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('video_name', videoName);
        formData.append('chat_text', message);

        try {
            const response = await axios.post('http://localhost:8080/bucket/send_chat', formData, {
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
        }
    };
            return (
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
                </div>
            );
}

export default MessageSender;
