import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { OverlayTrigger, Modal, Tooltip } from "react-bootstrap";
import { IP_ADDRESS, viewSentVideoPath, viewVideoPath, uploadVideoPath, loginPath} from "../Path";
import { useState, useEffect } from "react";
import axios from "axios";


const Sidebar = () => {
    const [activeTab, setActiveTab] = useState(viewSentVideoPath);
    const [currentUser, setCurrentUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [modal, setModal] = useState(true);

    const handleSetActiveTab = (tab) => {
        setActiveTab(tab);
    };  
    
    useEffect(() => {
      const fetchCurrentUser = async () => {
        try {
          const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
            withCredentials: true,
          });
  
          if (response.data.email) {
            setCurrentUser(response.data.email);
          } else {
            console.error("No user currently logged in");
          }
        } catch (error) {
          console.error("There was an error fetching the current user", error);
        }
      };
  
      fetchCurrentUser();
    }, []);
    return (
      <div className="sidebar">
          {currentUser && (
              <>
                  <NavLink
                      to={viewSentVideoPath}
                      className={`nav-link ${activeTab === "uploadedVideos" ? "active" : ""}`}
                      onClick={() => handleSetActiveTab("uploadedVideos")}
                  >
                      Videos Uploaded
                  </NavLink>
                  <NavLink
                      to={viewVideoPath}
                      className={`nav-link ${activeTab === "viewVideos" ? "active" : ""}`}
                      onClick={() => handleSetActiveTab("viewVideos")}
                  >
                      Videos Received
                  </NavLink>
              </>
          )}
          <NavLink
              to={uploadVideoPath}
              className={`nav-link ${activeTab === "uploadVideo" ? "active" : ""}`}
              onClick={() => handleSetActiveTab("uploadVideo")}
          >
              Upload Video
          </NavLink>

          {!currentUser && (
              <>
                  <OverlayTrigger
                      key="bottom"
                      placement="bottom"
                      overlay={<Tooltip id="tooltip-bottom">User not logged in</Tooltip>}
                  >
                      <div className="nav-link" style={{ cursor: 'not-allowed' }}>Videos Uploaded</div>
                  </OverlayTrigger>
                  <OverlayTrigger
                      key="bottom"
                      placement="bottom"
                      overlay={<Tooltip id="tooltip-bottom">User not logged in</Tooltip>}
                  >
                      <div className="nav-link" style={{ cursor: 'not-allowed' }}>Videos Received</div>
                  </OverlayTrigger>
              </>
          )}

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
      </div>
  );
};

export default Sidebar;