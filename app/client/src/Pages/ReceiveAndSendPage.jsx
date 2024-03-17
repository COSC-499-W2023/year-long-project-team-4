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
import Sidebar from './Sidebar';
import {Fade} from 'react-reveal';
import "./ReceiveAndSendPage.css";
import ViewSentVideoPage from './ViewSentVideoPage';
import ViewVideoPage from './ViewVideoPage';

const ReceiveAndSendPage = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("uploadedVideos"); // Default active tab
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
        setCurrentUser(null);
      }
    };
  
    fetchCurrentUser();
  }, []);  

  return (
    <Fade>
      <Container fluid className="d-flex p-0">
        {currentUser && <h3 className="text-center text-white p-2">Welcome, {currentUser}!</h3>}
        {errorMessage && (
          <Modal
            show={modal}
            onHide={() => setModal(false)}
            backdrop="static"
            keyboard={false}
            variant="Danger"
            contentClassName="bg-danger text-white"
          >
            <Modal.Header closeButton>
              <Modal.Title>Error!</Modal.Title>
            </Modal.Header>
            <Modal.Body>{errorMessage}</Modal.Body>
          </Modal>
        )}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="content" style={{ marginLeft: "250px", height: "calc(100vh - 56px)", overflowY: "scroll" }}> {/* Adjust 56px to match your header height */}
          
          
        </div>
      </Container>
    </Fade>
  );
};

export default ReceiveAndSendPage;