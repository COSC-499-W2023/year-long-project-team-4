import React, {useState, useEffect} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
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
          <div className="display-4 text-center"> Videos Uploaded </div>
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
  
  export default ViewSentVideoPage