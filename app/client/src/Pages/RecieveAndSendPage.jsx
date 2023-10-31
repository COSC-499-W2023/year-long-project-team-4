import React, {useEffect, useState} from 'react'
import {Button} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import {
  viewVideoPath,
  uploadVideoPath,
  loginPath,
} from "../Path";
const RecieveAndSendPage = () => {

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/auth/currentuser', {
      method: 'GET',  
    credentials: 'include'})
      .then(response => response.json())
      .then(data => {
        if (data.username) {
          setCurrentUser(data.username);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the current user', error);
      });
  }, []);

  const handleLogout = () => {
    fetch('http://localhost:8080/auth/logout', 
    {
      credentials: 'include',
    }
    )
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Handle successful logout
          console.log("success");
          navigate(loginPath);
        } else {
          console.error('Logout error:', data.error);
        }
      })
      .catch(error => {
        console.error('There was an error logging out', error);
      });
  };

  return (
    <div class="position-absolute top-50 start-50 translate-middle">
      {currentUser && <h3>Welcome, {currentUser}!</h3>}
       <div className="d-grid gap-2">
        <Button size="lg" href={uploadVideoPath}> Send Videos</Button> {" "}
        <Button size="lg" href={viewVideoPath}> Receive Videos</Button>
        <Button size="lg" onClick={handleLogout}>Logout</Button> 
      </div>
    </div>
  )
}

export default RecieveAndSendPage