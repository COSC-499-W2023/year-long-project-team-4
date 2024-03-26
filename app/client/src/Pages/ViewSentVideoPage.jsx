import React, {useState, useEffect} from 'react';
import {Row, Col, Button, Card} from 'react-bootstrap';
import { receiveAndSendPath } from '../Path';
import axios from 'axios';
// Animation library for smooth transitions
import {Fade} from 'react-reveal';
import {useNavigate} from 'react-router-dom';
import {
    MessagingPath,
    IP_ADDRESS,
  } from "../Path";

const ViewSentVideoPage = () => {
  
  const [videos, setVideos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  
  // Fetch sent videos on component mount
  useEffect(() => {
      axios.get(`${IP_ADDRESS}/bucket/get_sent_videos`, {
          withCredentials: true})
          .then(response => {
              setVideos(response.data);
              console.log(response.data)
          })
          .catch(error => {
              console.error('There was an error fetching the videos!', error);
          });

    return () => {};
      
  }, []);
  
  // Handles video selection and retrieves video URL
  const handleVideoClick = (videoName) => {
    navigate(MessagingPath, { state: { videoName: videoName } });
  };

  const [hoverIndex, setHoverIndex] = useState(-1); // State to keep track of which card is being hovered

  const hoverCardStyle = {
    backgroundColor: '#13056be0', // Default card background
    color: 'white', // Default text color
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  };

  const defaultCardStyle = {
    backgroundColor: 'white', // Hover card background
    color: '#13056be0', // Hover text color
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  };

  const getCardStyle = (isHovered) => (
    isHovered ? {...defaultCardStyle, ...hoverCardStyle} : defaultCardStyle
  );

  return (
    <Fade cascade>
      {/* Adjusted the padding top for the row that contains the heading */}
      <Row>
        <div className="display-4 text-center" style={{ color: '#13056be0', marginBottom: '2rem' }}>Videos Received</div>
      </Row>
      {/* Adjusted the margin bottom for each card for even spacing between cards */}
      <Row xs={1} md={2} className="g-4">
        {videos.map((video, index) => (
          <Col key={index} style={{ marginBottom: '1.5rem' }}> {/* This adds space below each card */}
            <Card 
              style={getCardStyle(index === hoverIndex)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(-1)}
              onClick={() => handleVideoClick(video.videoName)}
              className="mb-3" // You can remove this if you are now using inline styles
            >
              <Card.Body>
                <Card.Title>{video.videoName}</Card.Title>
                <Card.Text>
                  Sender's Email: <br />
                  Sender's Name: <br />
                  Tags:
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </Fade>
  );
}
  
  export default ViewSentVideoPage