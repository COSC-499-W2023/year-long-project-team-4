import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Fade } from 'react-reveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { MessagingPath, IP_ADDRESS, uploadVideoPath } from '../Path';
import '../css/ViewSentVideoPage.css';

const ViewVideoPage = ({setIsCollapsed, isCollapsed, currentUser}) => {
    const [videos, setVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const navigate = useNavigate();

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredVideos(videos);
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const searchedVideos = videos.filter(video =>
        video.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)) ||
        video.senderEmail.toLowerCase().includes(lowercasedSearchTerm) ||
        (video.senderFName.toLowerCase() + " " + video.senderLName.toLowerCase()).includes(lowercasedSearchTerm)||
        video.videoName.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredVideos(searchedVideos);
    }
  }, [searchTerm, videos]);

    useEffect(() => {
        setIsLoading(true);
        // Fetch videos on component mount
        axios.get(`${IP_ADDRESS}/bucket/getvideos`, {
            withCredentials: true
        })
        .then(response => {
            setVideos(response.data);
            console.log(response.data);
            setIsLoading(false);
        })
        .catch(error => {
            console.error('There was an error fetching the videos!', error);
            setIsLoading(false);
        });

        // Fetch current user on component mount
        const fetchCurrent =async()=> {
          try {
            const response = await axios.get(`${IP_ADDRESS}/auth/userdetails`, {
              withCredentials: true
            });
            console.log(response);
            if (response.data.email) {
              
              setIsAuthenticated(true);
            } else {
              console.error('No user currently logged in');
            }
          } catch (error) {
              navigate(uploadVideoPath);
              console.error('There was an error fetching the current user', error);
              setIsAuthenticated(false);
          }
        };
        fetchCurrent();}, [])
        
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
  
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
    
    // Handles video selection and retrieves video URL
    const handleVideoClick = (videoId) => {
      navigate(MessagingPath, { state: { videoId: videoId } });
    };

    return (
        <Fade cascade>
        <Row>
            <Col xs={12} md={isCollapsed? 0:2} className={isCollapsed ? 'sidebar-collapsed' : 'sidebar'}>
                <Fade>
                    <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
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
            <Container className='video-cards-container'>
        <Row className="mb-4 mt-4">
          <Col>
            <InputGroup id="search-bar" className="mb-3">
              <Form.Control
                placeholder="Search..."
                onChange={handleSearchChange}
                value={searchTerm}
              />
              <Button variant="outline-primary" onClick={() => setSearchTerm('')}>
                Clear
              </Button>
            </InputGroup>
          </Col>
        </Row>
        <Row>
        {isMobile && <h1 className="text-center display-6 mb-4">Received Video</h1>}
        {filteredVideos.length > 0 ? (
        filteredVideos.map((video, index) => (
          <Col key={index} md={4} className="col mb-4">
            <Card onClick={() => handleVideoClick(video.videoId)} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title><strong>{video.videoName}</strong></Card.Title>
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
        ))) : (
          <Col>
                    <div className="text-center" style={{ color: '#6c757d', marginTop: '20px' }}>
                      <h2>No Videos Found</h2>
                      <p>Received videos will appear here.</p>
                    </div>
                  </Col>
                )}
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
