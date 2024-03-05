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
  
  // Handles video selection and retrieves video URL
  const handleVideoClick = (videoName) => {
    navigate(MessagingPath, { state: { videoName: videoName } });
  };
  

  return (
     <Fade cascade>
      <Row>
          <div className="display-4 text-center"> Videos Received </div>
           <Col className="p-3">
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