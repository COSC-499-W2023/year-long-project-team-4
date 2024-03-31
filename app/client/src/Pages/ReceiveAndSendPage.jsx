import React, {useState} from 'react'
import {Container,Modal} from 'react-bootstrap'
import UploadVideoPage from './UploadVideoPage';
import {Fade} from 'react-reveal';
import "./ReceiveAndSendPage.css";
import ViewSentVideoPage from './ViewSentVideoPage';
import ViewVideoPage from './ViewVideoPage';

const ReceiveAndSendPage = ({currentUser}) => {

  const [errorMessage, setErrorMessage] = useState(null);
  const [modal, setModal] = useState(true);
  
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
            data-bs-target="#uploadVideos"  
            type="button" 
            role="tab" 
            aria-selected="false"
            aria-controls="uploadVideos" 
            >
              Upload Video
          </button>
        </div>
        <div className="tab-content" id="v-pills-tabContent">
          <div 
            className="tab-pane fade show active" 
            id="uploadedVideos" 
            role="tabpanel">
              <ViewSentVideoPage />
          </div>
          <div 
            className="tab-pane fade" 
            id="viewVideos" 
            role="tabpanel">
              <ViewVideoPage />
          </div>
          <div 
            className="tab-pane fade mb-2" 
            id="uploadVideos" 
            role="tabpanel">
              <UploadVideoPage/>
          </div>
        </div>
      </div>
      </Container>
    </Fade>
  )
}

export default ReceiveAndSendPage