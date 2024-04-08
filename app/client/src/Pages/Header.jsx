import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ReactComponent as Person } from "../Assets/person.svg";
import { ReactComponent as Logout } from "../Assets/box-arrow-right.svg";
import { ReactComponent as Logo } from "../Assets/thislogo1.svg";
import { ReactComponent as MenuIcon } from "../Assets/hamburger-icon.svg";
import { Navbar, Button, OverlayTrigger, Modal, Tooltip } from "react-bootstrap";
import { IP_ADDRESS, accountPath, loginPath, viewSentVideoPath } from "../Path";
import { useState, useEffect } from "react";
import "../css/Header.css";
import axios from "axios";

const Header = ({currentUser, setCurrentUser, isCollapsed, setIsCollapsed}) => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);
    const [modal, setModal] = useState(true);
   
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

    const sendAccount = () =>{
      navigate(accountPath);
    }

    const toggleMenu = () => {
      setIsCollapsed(!isCollapsed);
    }
  
  return (
    <>
    
    <Navbar className="bg-primary">
        
      {currentUser ? (
        <>
        <Button className="menu-toggler" type="button" onClick={toggleMenu}>
            <MenuIcon className="menu-svg"/>
        </Button>
        <Navbar.Brand onClick={handleLink} className="me-auto" style={{ marginRight: "20px" }}>
          <Logo className="logo-svg"/>
      </Navbar.Brand>
        
        <Navbar.Collapse className="justify-content-end">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Account Page</Tooltip>}
          >
            <Button className="m-2 custom-button" onClick={sendAccount}>
              <Person fill={"white"}/>
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Logout</Tooltip>}
          >
            <Button className="m-2 custom-button" onClick={handleLogout}>
              <Logout fill={"white"}/>
            </Button>
          </OverlayTrigger>
        </Navbar.Collapse>
        </>
      ) : (
        <>
        <Navbar.Brand onClick={handleLink} className="me-auto" style={{ marginRight: "20px" }}>
          <Logo className="logo-svg"/>
        </Navbar.Brand>
        </>
      )}
    
  </Navbar>
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
  </>
  )
}

export default Header;