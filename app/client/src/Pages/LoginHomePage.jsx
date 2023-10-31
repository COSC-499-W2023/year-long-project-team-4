import React, {useEffect, useState} from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
  recieveAndSendPath,
  registerPath,
} from "../Path";
const LoginHomePage = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (username, password) => {
    fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${username}&password=${password}`,
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.username) {
          setCurrentUser(data.username);
          console.log(data)
          navigate(recieveAndSendPath);
        } else {
          console.error(data.error);
          setErrorMessage(data.error);
        }
      })
      .catch(error => {
        console.error('There was an error logging in', error);
        setErrorMessage('An error occurred. Please try again.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.elements[0].value;  // Assuming the first input is the username
    const password = e.target.elements[1].value;  // Assuming the second input is the password
    handleLogin(username, password);
  };

  {/*const handleSubmit = (e) => {
    e.preventDefault();
    navigate(recieveAndSendPath);
  }*/}
  
  
   return (
    <div className="position-absolute top-50 start-50 translate-middle">          
      <Card border="primary" style={{ width: "16rem" }}>  
        <Card.Body className="text-center">
          <Card.Title>Login</Card.Title>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="p-3">
                <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    required
                  />
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                  />
              </Form.Group>   
              <Button type="submit" className="mb-2" variant="primary"> Login </Button>
            </Form>
        </Card.Body>
        <Card.Link className="text-center"  href={recieveAndSendPath}>Use as guest</Card.Link>
        <Card.Link className="text-center" href={registerPath}>No account?</Card.Link>
      </Card>
    </div>
  )
}

export default LoginHomePage