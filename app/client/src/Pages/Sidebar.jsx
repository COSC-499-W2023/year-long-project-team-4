// Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Navbar, Button, OverlayTrigger, Modal, Tooltip } from "react-bootstrap";
import { IP_ADDRESS, accountPath, homePath, viewSentVideoPath, viewVideoPath, receiveAndSendPath, uploadVideoPath} from "../Path";
import { useState, useEffect } from "react";
import axios from "axios";
import ViewSentVideoPage from './ViewSentVideoPage';
import ViewVideoPage from './ViewVideoPage';

const Sidebar = () => {
    const [activeTab, setActiveTab] = useState(viewSentVideoPath);

    const handleSetActiveTab = (tab) => {
        setActiveTab(tab);
    };  
    return (
        <div className="sidebar">
          <NavLink
            to={viewSentVideoPath}
            className={`nav-link ${activeTab === "uploadedVideos" ? "active" : ""}`}
            onClick={() => handleSetActiveTab("uploadedVideos")}
            style={{ maxWidth: '200px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            Videos Uploaded
          </NavLink>
          <NavLink
            to={viewVideoPath}
            className={`nav-link ${activeTab === "viewVideos" ? "active" : ""}`}
            onClick={() => handleSetActiveTab("viewVideos")}
            style={{ maxWidth: '200px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            Videos Received
          </NavLink>
          <NavLink
            to={uploadVideoPath}
            className={`nav-link ${activeTab === "uploadVideo" ? "active" : ""}`}
            onClick={() => handleSetActiveTab("uploadVideo")}
            style={{ maxWidth: '200px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            Upload Video
          </NavLink>
        </div>
      );
    };
    
    export default Sidebar;