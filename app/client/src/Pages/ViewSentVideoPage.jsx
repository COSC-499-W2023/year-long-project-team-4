import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Fade } from 'react-reveal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewSentVideoPage.css'; // Ensure this file contains no conflicting styles
import { MessagingPath, IP_ADDRESS } from "../Path";

const ViewSentVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${IP_ADDRESS}/bucket/get_sent_videos`, { withCredentials: true })
      .then(response => {
        // Assuming the response data includes senderEmail, senderName, and tags
        setVideos(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the videos!', error);
        setErrorMessage('Error fetching videos');
      });
  }, []);

  const handleVideoClick = (videoId) => {
    navigate(MessagingPath, { state: { videoId: videoId } });
  };

  return (
    <Fade cascade>
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Received Videos</h1>
          </Col>
        </Row>
        <Row>
          {videos.map((video, index) => (
            <Col key={index} className="col mb-4"> {/* This applies full width on all breakpoints */}
              <Card onClick={() => handleVideoClick(video.videoId)} style={{ cursor: 'pointer' }}>
                <Card.Body>
                  <Card.Title>{video.videoName}</Card.Title>
                  <Card.Text>
                    Sender's Email: {video.senderEmail}<br />
                    Sender's Name: {video.senderLName}<br />
                    Tags: {video.tags ? video.tags.join(', ') : 'None'}<br />
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
