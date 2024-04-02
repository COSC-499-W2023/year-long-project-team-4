import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Fade } from 'react-reveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { MessagingPath, IP_ADDRESS, uploadVideoPath } from '../Path';

const ViewVideoPage = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch videos on component mount
        axios.get(`${IP_ADDRESS}/bucket/getvideos`, {
            withCredentials: true
        })
        .then(response => {
            setVideos(response.data);
            console.log(response.data)
        })
        .catch(error => {
            console.error('There was an error fetching the videos!', error);
        });

        // Fetch current user on component mount
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
                    withCredentials: true
                });

                if (response.data.email) {
                    setIsAuthenticated(true);
                } else {
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



    // Handles video selection and redirects to messaging page
    const handleVideoClick = (videoName) => {
        navigate(MessagingPath, { state: { videoName: videoName } });
    };

    const [hoverIndex, setHoverIndex] = useState(-1); // State to keep track of which card is being hovered

    const defaultCardStyle = {
      backgroundColor: '#13056be0', // Default card background
      color: 'white', // Default text color
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    };

    const hoverCardStyle = {
      backgroundColor: 'white', // Hover card background
      color: '#13056be0', // Hover text color
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    };

    const getCardStyle = (isHovered) => (
      isHovered ? {...defaultCardStyle, ...hoverCardStyle} : defaultCardStyle
    );

    return (
        <Fade cascade>
            <Row>
                <Col xs={2}>
                    <Fade>
                        <Sidebar />
                    </Fade>
                </Col>
                <Col xs={10}>
                    <div className="display-4 text-center"> Videos Received </div>
                    <div className="display-6"> Videos</div>
                    {videos.map((video, index) => (
                        <div key={index} onClick={() => handleVideoClick(video.videoName)}>
                            <Button className='text-center mb-2' style={{minWidth: '150px'}}>
                                <p>Video{index + 1}</p>
                            </Button>
                        </div>
                    ))}
                </Col>   
            </Row>    
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </Fade>
    );
};

export default ViewVideoPage;
