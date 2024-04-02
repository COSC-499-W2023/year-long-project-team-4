// Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import './Sidebar.css';
import { Navbar, Button, OverlayTrigger, Modal, Tooltip } from "react-bootstrap";
import { ReactComponent as Logout } from "../Assets/box-arrow-right.svg";
import { ReactComponent as Person } from "../Assets/person.svg";
import { IP_ADDRESS, accountPath, homePath, viewSentVideoPath, viewVideoPath, uploadVideoPath, loginPath} from "../Path";
import { useState, useEffect } from "react";
import axios from "axios";
import ViewSentVideoPage from './ViewSentVideoPage';
import ViewVideoPage from './ViewVideoPage';

const Sidebar = () => {
    const navigate = useNavigate();
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
  
    const handleLogout = async () => {
      try {
        const response = await axios.get(`${IP_ADDRESS}/auth/logout`, {
          withCredentials: true, // Important for handling sessions with cookies
        });
  
        if (response.data.success) {
          // Handle successful logout
          console.log("Logged out successfully");
          setCurrentUser(null);
          navigate(loginPath);
        } else {
          console.error("Logout error:", response.data.error);
        }
      } catch (error) {
        if (error.response && error.response.data.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage("There was an error Logging out");
        }
      }
    };

    const handleLink = () => {
      if (currentUser) {
        navigate(viewSentVideoPath);
      } else {
        navigate(loginPath);
      }
    }

    return (
      <div className="sidebar" style={{ height: '100vh', width: '200px', position: 'fixed', top: 0, left: 0, bottom: 0, overflow: 'hidden' }}>
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