import React, {useState, useEffect} from 'react';
import {Row, Col, Button, Modal} from 'react-bootstrap';
import { receiveAndSendPath } from '../Path';
import axios from 'axios';
// Animation library for smooth transitions
import {Fade} from 'react-reveal';
import {useNavigate} from 'react-router-dom';
import {
    MessagingPath
  } from "../Path";
import io from 'socket.io-client';


const socket = io('http://localhost:8080');

const ViewSentVideoPage = () => {
  
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  
  // Fetch sent videos on component mount
  useEffect(() => {
      axios.get('http://localhost:8080/bucket/get_sent_videos', {
          withCredentials: true})
          .then(response => {
              setVideos(response.data);
              console.log(response.data)
          })
          .catch(error => {
              console.error('There was an error fetching the videos!', error);
          });

          socket.on('chat_response', (response) => {
            console.log("any response?");
            if (response.status === 'success') {
                console.log('Chat created successfully with ID:', response.chat_id);
                // You might want to navigate to the chat page or perform another action here
            } else {
                console.log(response.error);
                setErrorMessage(response.error);
            }
        });

        // Cleanup on component unmount
        return () => socket.off('chat_response');
  }, []);
  
  // Handles video selection and retrieves video URL
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

  const handleStartChat = (e, videoName) => {
    e.preventDefault();
    console.log(`Attempting to start chat for video: ${videoName}`);
    socket.emit('create_chat', { video_name: videoName });
    navigate(MessagingPath, { state: { videoName: videoName } });
};

  {/*
  // Handles the creation of a chat associated with a video
  const handleStartChat = (e, videoName) => {
    e.preventDefault();
    // Create a new FormData instance
    const formData = new FormData();
    formData.append('video_name', videoName); 

    axios.post('http://localhost:8080/bucket/create_chat', formData, { 
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(response => {
        console.log('Chat created:', response.data);
        navigate(MessagingPath, { state: { videoName: videoName } });
    })
    .catch(error => {
        if (error.response) {
            console.error('Error response:', error.response.data);
            // Check if the error is because the chat already exists
            if (error.response.data.error === "Associated chat already exists") {
                navigate(MessagingPath, { state: { videoName: videoName } }); // Navigate to messaging page if chat already exists
            } else {
                setErrorMessage(error.response.data.error || 'Error creating chat');
            }
        } else {
            console.error('Error creating chat:', error);
            setErrorMessage('Error creating chat');
        }
    });
};*/}

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
                          <Button variant="info" onClick={(e) => handleStartChat(e, video.videoName)}>Start Chat</Button>
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