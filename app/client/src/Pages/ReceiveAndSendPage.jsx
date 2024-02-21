import React, {useEffect, useState} from 'react'
import {Button, Container,Modal} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import {
  uploadVideoPath,
  loginPath,
  viewSentVideoPath,
  IP_ADDRESS
} from "../Path";
import axios from 'axios';
import {Fade} from 'react-reveal';
import "./ReceiveAndSendPage.css";
import ViewSentVideoPage from './ViewSentVideoPage';
import ViewVideoPage from './ViewVideoPage';

const ReceiveAndSendPage = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(true);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
          withCredentials: true
        });
  
        if (response.data.email) {
          setCurrentUser(response.data.email);
        } else {
          console.error('No user currently logged in');
        }
      } catch (error) {
        console.error('There was an error fetching the current user', error);
        setErrorMessage('There was an error fetching the current user');
      }
    };
  
    fetchCurrentUser();
  }, []);  

  return (
    <Fade>
      <Container fluid>
      {currentUser && <h3 className="text-center text-white p-2">Welcome, {currentUser}!</h3>}
      {errorMessage &&
        <Modal
        show={modal}
        onHide={()=>setModal(false)}
        backdrop="static"
        keyboard={false}
        variant="Danger"
        contentClassName="bg-danger text-white"
        >
          <Modal.Header closeButton>
              <Modal.Title>Error!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errorMessage}
          </Modal.Body>
        </Modal>
      }
      <div className="d-flex align-items-start">
        <div className="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
          <button 
            className="nav-link active p-4 m-2"  
            data-bs-toggle="pill" 
            data-bs-target="#uploadedVideos" 
            type="button" role="tab" 
            aria-controls="uploadedVideos" 
            aria-selected="true"
          >
              Videos uploaded
          </button>
          <button 
            className="nav-link p-4 m-2" 
            data-bs-toggle="pill" 
            data-bs-target="#viewVideos" 
            type="button" 
            role="tab" 
            aria-controls="viewVideos" 
            aria-selected="false"
          >
            Videos Received
          </button>
          <button
            className="nav-link p-4 m-2" 
            data-bs-toggle="pill" 
            type="button" 
            role="tab" 
            aria-selected="false"
            onClick={()=>navigate(uploadVideoPath)}
            >
              Upload Video
          </button>
        </div>
        <div className="tab-content" id="v-pills-tabContent">
          <div 
            className="tab-pane fade show active text-white" 
            id="uploadedVideos" 
            role="tabpanel">
              <ViewSentVideoPage />
          </div>
          <div 
            className="tab-pane fade text-white" 
            id="viewVideos" 
            role="tabpanel">
              <ViewVideoPage />
          </div>
        </div>
      </div>
      </Container>
    </Fade>
  )
}

export default ReceiveAndSendPage