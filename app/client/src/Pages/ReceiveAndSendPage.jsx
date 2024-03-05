import React, {useEffect, useState} from 'react'
import {Button} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import {
  uploadVideoPath,
  loginPath,
  accountPath,
  viewSentVideoPath,
  IP_ADDRESS
} from "../Path";
import axios from 'axios';
import {Fade} from 'react-reveal';

const ReceiveAndSendPage = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${IP_ADDRESS}/auth/logout`, {
        withCredentials: true  // Important for handling sessions with cookies
      });
  
      if (response.data.success) {
        // Handle successful logout
        console.log("Logged out successfully");
        setCurrentUser(null);
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
        setErrorMessage('There was an error fetching the current user');
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
          <Button size="lg" href={viewSentVideoPath}> Sent Videos</Button>
          <Button size="lg" href={accountPath}> Receive Videos</Button>
          <>
          {currentUser?
          (
            <Button size="lg" onClick={handleLogout} href={loginPath}>Logout</Button> 
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