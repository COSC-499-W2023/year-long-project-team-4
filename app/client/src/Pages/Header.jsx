import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ReactComponent as Person } from "../Assets/person.svg";
import { ReactComponent as Logout } from "../Assets/box-arrow-right.svg";
import { ReactComponent as Logo } from "../Assets/thislogo1.svg";
import { Navbar, Button, OverlayTrigger, Modal, Tooltip } from "react-bootstrap";
import { IP_ADDRESS, accountPath, homePath, loginPath, viewSentVideoPath } from "../Path";
import { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [modal, setModal] = useState(true);
  
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
    <>
    <Navbar className="bg-primary" style={{ height: "80px", padding: "0 20px" }}>
        
      {currentUser ? (
        <>
        <Navbar.Brand onClick={handleLink} className="me-auto" style={{ marginRight: "20px" }}>
          <Logo />
        </Navbar.Brand>
        
        <Navbar.Collapse className="justify-content-end">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Account Page</Tooltip>}
          >
            <Button className="m-2" href={accountPath}>
              <Person fill={"white"} height="50" width="50" />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Logout</Tooltip>}
          >
            <Button className="m-2" onClick={handleLogout}>
              <Logout fill={"white"} height="50" width="50" />
            </Button>
          </OverlayTrigger>
        </Navbar.Collapse>
        </>
      ) : (
        <></>
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