import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import { Fade } from 'react-reveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './ViewSentVideoPage.css'; 
import { MessagingPath, IP_ADDRESS, uploadVideoPath } from '../Path';

const ViewVideoPage = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
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

    useEffect(() => {
      axios.get(`${IP_ADDRESS}/bucket/get_sent_videos`, { withCredentials: true })
        .then(response => {
          // Assuming the response data includes senderEmail, senderName, and tags
          setVideos(response.data);
          setFilteredVideos(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the videos!', error);
          setErrorMessage('Error fetching videos');
        });
    }, []);
  
    useEffect(() => {
      if (!searchTerm) {
        setFilteredVideos(videos);
      } else {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const searchedVideos = videos.filter(video =>
          video.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm))
        );
        setFilteredVideos(searchedVideos);
      }
    }, [searchTerm, videos]);
  
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
  
    const handleVideoClick = (videoId) => {
      navigate(MessagingPath, { state: { videoId: videoId } });
    };

    return (
        <Fade cascade>
            <Row>
                <Col xs={2}>
                    <Fade>
                        <Sidebar />
                    </Fade>
                </Col>
                <Col xs={10}>
                <Container className='video-cards-container'>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Uploaded Videos</h1>
            <InputGroup id="search-bar" className="mb-3">
              <Form.Control
                placeholder="Search by tags..."
                onChange={handleSearchChange}
                value={searchTerm}
              />
              <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                Clear
              </Button>
            </InputGroup>
          </Col>
        </Row>
        <Row>
        {filteredVideos.map((video, index) => (
          <Col key={index} md={4} className="col mb-4">
            <Card onClick={() => handleVideoClick(video.videoId)} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title>{video.videoName}</Card.Title>
                <Card.Text>
                  <strong>Sender's Email: </strong>{video.senderEmail}<br />
                  Sender's Name: {video.senderFName} {video.senderLName}<br />
                  Tags:
                  <div className="tags-container">
                    {video.tags.length > 0 ? video.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag-badge">{tag}</span>
                    )) : 'None'}
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
        {errorMessage && <div className="text-center text-danger">{errorMessage}</div>}
      </Container>
                </Col>   
            </Row>    
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </Fade>
    );
};

export default ViewVideoPage;
