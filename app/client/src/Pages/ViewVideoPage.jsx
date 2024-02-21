import React, {useState, useEffect} from 'react';
import {Row, Col, Button, Modal} from 'react-bootstrap';
import { receiveAndSendPath } from '../Path';
import axios from 'axios';
import {Fade} from 'react-reveal';
import {useNavigate} from 'react-router-dom';
import {
    MessagingPath,
    IP_ADDRESS,
  } from "../Path";

const ViewVideoPage = () => {
  
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  
  //Fetch videos on component mount
  useEffect(() => {
      // Replace with the correct URL of your backend
      axios.get(`${IP_ADDRESS}/bucket/getvideos`, {
          withCredentials: true})
          .then(response => {
              setVideos(response.data);
              console.log(response.data)
          })
          .catch(error => {
              console.error('There was an error fetching the videos!', error);
          });
  }, []);
  
  //Opens the video in a modal
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

  //Function for starting a new chat
  const handleStartChat = (e, videoName) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('video_name', videoName); // Append the video name to the FormData

    //POST request to create a new chat room
    axios.post(`${IP_ADDRESS}/bucket/create_chat`, formData, { 
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    //redirect to Messaging Page after creating the chat
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
};

  return (
     <Fade cascade>
      <Row>
          <div className="display-4 text-center text-light"> Videos Received </div>
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
  
  export default ViewVideoPage