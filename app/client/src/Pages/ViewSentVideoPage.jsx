import React, {useState, useEffect} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import { receiveAndSendPath } from '../Path';
import { Container } from 'react-bootstrap';
import axios from 'axios';
// Animation library for smooth transitions
import {Fade} from 'react-reveal';
import {useNavigate} from 'react-router-dom';
import {
    MessagingPath,
    IP_ADDRESS,
  } from "../Path";
import io from 'socket.io-client';
import Sidebar from './Sidebar';

const socket = io(`${IP_ADDRESS}`,  {
    withCredentials: true,
  });

const ViewSentVideoPage = () => {
  
  const [videos, setVideos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  
  // Fetch sent videos on component mount
  useEffect(() => {
    socket.on('connect', () => {
        console.log('Connected to the server');
      });
  

      axios.get(`${IP_ADDRESS}/bucket/get_sent_videos`, {
          withCredentials: true})
          .then(response => {
              setVideos(response.data);
              console.log(response.data)
          })
          .catch(error => {
              console.error('There was an error fetching the videos!', error);
          });

    socket.on('disconnect', (reason) => {
        console.log(`Disconnected from the server due to ${reason}`);
    });

    return () => {
        socket.off('connect');
        socket.off('disconnect');
      };
      
  }, []);
  
  // Handles video selection and retrieves video URL
  const handleVideoClick = (videoName) => {
    navigate(MessagingPath, { state: { videoName: videoName } });
  };

  return (
      <Row>
        <Col xs={2}>
          <Fade>
          <Sidebar />
          </Fade>
        </Col>
        <Col xs={10}>
          <Fade cascade>
            <div>
              <div className="display-4 text-center">Videos Uploaded</div>
              <div className="display-6">Videos</div>
              {videos.map((video, index) => (
                <div key={index} onClick={() => handleVideoClick(video.videoName)}>
                  <Button className="text-center mb-2" style={{ minWidth: '150px' }}>
                    <p>Video{index + 1}</p>
                  </Button>
                </div>
              ))}
            </div>
          </Fade>
        </Col>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </Row>
  
  );
};

export default ViewSentVideoPage;