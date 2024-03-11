import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

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
            <div className="sidebar d-flex flex-column justify-content-between">
              <button
                className="nav-link active p-4 m-2"
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
            </div>
          </Container>
        </Fade>
      )
};

export default Sidebar;
