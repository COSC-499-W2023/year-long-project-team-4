import React, {useState, useEffect} from 'react';
import {Row, Col, Button, Modal} from 'react-bootstrap';
import { receiveAndSendPath } from '../Path';
import axios from 'axios';
// Animation library for smooth transitions
import {Fade} from 'react-reveal';
import {useNavigate} from 'react-router-dom';
import {
    MessagingPath,
    IP_ADDRESS,
  } from "../Path";
import io from 'socket.io-client';

const socket = io(`${IP_ADDRESS}`,  {
    withCredentials: true,
  });

const ViewSentVideoPage = () => {
  
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
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
      const formData = new FormData();
      formData.append('video_name', videoName);
  
      axios.post(`${IP_ADDRESS}/bucket/retrieve`, formData, {
          withCredentials: true,
          responseType: 'blob' // Sets the expected response type to 'blob' since a video file is binary data
      })
      .then(response => {
          const videoURL = URL.createObjectURL(response.data);
          setSelectedVideo(videoURL);
          setShowVideoModal(true);
      })
      .catch(error => {
          console.error('There was an error retrieving the video!', error);
      });
  };
  
  const handleCloseVideoModal = () => {
      setShowVideoModal(false);
      setSelectedVideo(null);
  };

  // Handles the creation of a chat associated with a video
  const handleOpenChat = (e, videoName) => {
    e.preventDefault();

    socket.emit('join_chat', { chat_name: videoName });

    navigate(MessagingPath, { state: { videoName: videoName } });
};

  return (
     <Fade cascade>
      <Row>
          <div className="display-4 text-center text-light"> Sent Videos </div>
           <Col className="p-3">
               <div className="display-6 text-light"> Videos</div>
               {videos.map((video, index) => (
                            <>
                          <div key={index} onClick={() => handleVideoClick(video.videoName)}>
                              <Button className='text-center mb-2' style={{minWidth: '150px'}}>
                              <p>Video{index + 1}</p>
                              </Button>
                          </div>
                          <Button variant="info" onClick={(e) => handleOpenChat(e, video.videoName)}>Start Chat</Button>
                          </>
                      ))}
          </Col>   
      </Row>      
          <div className="text-center p-4">
              <Button href={receiveAndSendPath}> Return to Home</Button>
          </div>
  
          <Modal show={showVideoModal} onHide={handleCloseVideoModal}>
                  <Modal.Header closeButton>
                      <Modal.Title>Video Playback</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      {selectedVideo && <video src={selectedVideo} width="100%" controls autoPlay />}
                  </Modal.Body>
          </Modal>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
     </Fade>
    )
  }
  
  export default ViewSentVideoPage