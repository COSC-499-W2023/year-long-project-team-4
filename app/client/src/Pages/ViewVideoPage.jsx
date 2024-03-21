import React, {useState, useEffect} from 'react';
import {Row, Col, Button, Modal} from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { viewSentVideoPath } from '../Path';
import axios from 'axios';
import {Fade} from 'react-reveal';
import Sidebar from './Sidebar';
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
  
  // Handles video selection and retrieves video URL
  const handleVideoClick = (videoName) => {
    navigate(MessagingPath, { state: { videoName: videoName } });
  };
  

  return (
     <Fade cascade>
      <Row>
            <Col xs={2}>
                <Fade>
                <Sidebar />
                </Fade>
            </Col>
            <Col xs={10}>
          <div className="display-4 text-center"> Videos Received </div>
           
               <div className="display-6"> Videos</div>
               {videos.map((video, index) => (
                    <>
                        <div key={index} onClick={() => handleVideoClick(video.videoName)}>
                            <Button className='text-center mb-2' style={{minWidth: '150px'}}>
                                <p>Video{index + 1}</p>
                            </Button>
                        </div>
                    </>
                ))}
           </Col>   
        </Row>    
        {errorMessage && <div className="error-message">{errorMessage}</div>}
     </Fade>
    )
  }
  
  export default ViewVideoPage