import React, {useEffect, useState} from 'react'
import {Button} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import {
  viewVideoPath,
  uploadVideoPath,
  loginPath,
  accountPath,
} from "../Path";
import axios from 'axios';
import {Fade} from 'react-reveal';

const ReceiveAndSendPage = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:8080/auth/logout', {
        withCredentials: true  // Important for handling sessions with cookies
      });
  
      if (response.data.success) {
        // Handle successful logout
        console.log("Logged out successfully");
        setCurrentUser(null);
        navigate(loginPath);
      } else {
        console.error('Logout error:', response.data.error);
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('There was an error Logging out');
      }
    }
  };
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:8080/auth/currentuser', {
          withCredentials: true
        });
  
        if (response.data.username) {
          setCurrentUser(response.data.username);
        } else {
          console.error('No user currently logged in');
        }
      } catch (error) {
        console.error('There was an error fetching the current user', error);
      }
    };
  
    fetchCurrentUser();
  }, []);  

  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      {currentUser && <h3>Welcome, {currentUser}!</h3>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <Fade>
        <div className="d-grid gap-2">
          <Button size="lg" href={uploadVideoPath}> Send Videos</Button>
          <Button size="lg" href={viewVideoPath}> Receive Videos</Button>
          <Button size="lg" onClick={handleLogout}>Logout</Button> 
        </div>
      </Fade>
    </div>
  )
}

export default ReceiveAndSendPage