import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Fade } from 'react-reveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../css/ViewSentVideoPage.css'; 
import { MessagingPath, IP_ADDRESS, uploadVideoPath } from '../Path';

const ViewVideoPage = ({setIsCollapsed, isCollapsed, currentUser}) => {
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch current user on component mount
        const fetchCurrentUser = async () => {
            try {
                if (currentUser) {
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
    if (!searchTerm) {
      setFilteredVideos(videos);
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const searchedVideos = videos.filter(video =>
        video.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)) ||
        video.senderEmail.toLowerCase().includes(lowercasedSearchTerm) ||
        (video.senderFName.toLowerCase() + " " + video.senderLName.toLowerCase()).includes(lowercasedSearchTerm) ||
        video.videoName.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredVideos(searchedVideos);
    }
  }, [searchTerm, videos]);

    useEffect(() => {
      setIsLoading(true);

      axios.get(`${IP_ADDRESS}/bucket/get_sent_videos`, { withCredentials: true })
        .then(response => {
          // Assuming the response data includes senderEmail, senderName, and tags
          setVideos(response.data);
          setFilteredVideos(response.data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('There was an error fetching the videos!', error);
          setErrorMessage('Error fetching videos');
          setIsLoading(false);
        });
    }, []);
  
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
  
    const handleVideoClick = (videoId) => {
      navigate(MessagingPath, { state: { videoId: videoId } });
    };

    return (
        <Fade cascade>
            <Row>
                <Col xs={12} md={isCollapsed? 0:2} className={isCollapsed ? 'sidebar-collapsed' : 'sidebar'}>
                    <Fade>
                        <Sidebar setIsCollapsed={setIsCollapsed}/>
                    </Fade>
                </Col>
                <Col xs={12} md={isCollapsed? 12:10}>
                {isLoading ? (
          // Show spinner when isLoading is true
          <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
          ) : (
            // Show the container with videos when isLoading is false
            <Container className='video-cards-container'>
        <Row className="mb-4 mt-4">
          <Col>
            {/*<h1 className="text-center display-6">Uploaded Videos</h1>*/}
            <InputGroup id="search-bar" className="mb-3">
              <Form.Control
                placeholder="Search..."
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
                <Card.Title><strong>{video.videoName}</strong></Card.Title>
                <Card.Text>
                  Sender's Email: {video.senderEmail}<br />
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
      )}
                </Col>   
            </Row>    
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </Fade>
    );
};

export default ViewVideoPage;
