import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import { Fade } from 'react-reveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewSentVideoPage.css'; // Ensure this file contains no conflicting styles
import { MessagingPath, IP_ADDRESS } from "../Path";

const ViewSentVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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
    </Fade>
  );
}

export default ViewSentVideoPage;
