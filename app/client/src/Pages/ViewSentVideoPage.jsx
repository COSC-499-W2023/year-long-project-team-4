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

  return (
    <Fade cascade>
      <Row>
        <div className="display-4 text-center">Videos Received</div>
        <Col className="p-3">
          <div className="display-6">Videos</div>
          {videos.map((video, index) => (
            <Card key={index} className="mb-3" onClick={() => handleVideoClick(video.videoName)}>
              <Card.Body>
                <Card.Title>{video.videoName}</Card.Title>
                <Card.Text>
                  Sender's Email: <br />
                  Sender's Name: <br />
                  Tags: 
                </Card.Text>
                <Button variant="primary">View Video</Button>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </Fade>
  )
  }
  
  export default ViewSentVideoPage