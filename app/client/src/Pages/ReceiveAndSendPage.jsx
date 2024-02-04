import React, {useEffect, useState} from 'react'
import {Button} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import {
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
      const response = await axios.get(`${process.env.REACT_APP_IP_ADDRESS}/auth/logout`, {
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
        const response = await axios.get(`${process.env.REACT_APP_IP_ADDRESS}/auth/currentuser`, {
          withCredentials: true
        });
  
        if (response.data.email) {
          setCurrentUser(response.data.email);
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
          <Button size="lg" href={accountPath}> Receive Videos</Button>
          <>
          {currentUser?
          (
            <Button size="lg" onClick={handleLogout}>Logout</Button> 
          ):
          (<></>)
          }
          </>
        </div>
      </Fade>
    </div>
  )
}

export default ReceiveAndSendPage