import React, {useState, useEffect} from 'react';
import {Row, Col, Button, Modal} from 'react-bootstrap';
import { recieveAndSendPath } from '../Path';
import axios from 'axios';
import {Fade} from 'react-reveal';

const ViewVideoPage = () => {
  
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  useEffect(() => {
      // Replace with the correct URL of your backend
      axios.get('http://localhost:8080/bucket/getvideos', {
          withCredentials: true})
          .then(response => {
              setVideos(response.data);
              console.log(response.data)
          })
          .catch(error => {
              console.error('There was an error fetching the videos!', error);
          });
  }, []);
  
  
  
  const handleVideoClick = (videoName) => {
      const formData = new FormData();
      formData.append('video_name', videoName);
  
      axios.post('http://localhost:8080/bucket/retrieve', formData, {
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
  
  return (
     <Fade cascade>
      <Row>
          <div className="display-4 text-center text-light"> Receive Videos </div>
           <Col className="p-3">
               <div className="display-6 text-light"> Videos Viewable</div>
               {videos.map((video, index) => (
                          <div key={index} onClick={() => handleVideoClick(video.videoName)}>
                              <Button className='text-center mb-2' style={{minWidth: '150px'}}>
                              <p>Video{index + 1}</p>
                              </Button>
                          </div>
                      ))}
          </Col>   
      </Row>      
          <div className="text-center p-4">
              <Button href={recieveAndSendPath}> Return to Home</Button>
          </div>
  
          <Modal show={showVideoModal} onHide={handleCloseVideoModal}>
                  <Modal.Header closeButton>
                      <Modal.Title>Video Playback</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      {selectedVideo && <video src={selectedVideo} width="100%" controls autoPlay />}
                  </Modal.Body>
          </Modal>
     
     </Fade>
    )
  }
  
  export default ViewVideoPage