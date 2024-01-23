import React, {useEffect, useState} from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {Fade} from "react-reveal";
import {
  guestPath,
  receiveAndSendPath,
  registerPath,
} from "../Path";
import axios from 'axios'

const LoginHomePage = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });
  
      if (response.data.username) {
        setCurrentUser(response.data.username);
        navigate(receiveAndSendPath);
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      }
      else{
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.elements[0].value;  // Assuming the first input is the username
    const password = e.target.elements[1].value;  // Assuming the second input is the password
    handleLogin(username, password);
  };
  
  
   return (
    <div className="position-absolute top-50 start-50 translate-middle text-white text-center">          
      <Fade big cascade>
        <div className="display-3">Login</div>
      </Fade>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <Fade big cascade>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="p-3">
            <Form.Label htmlFor='username'>Username</Form.Label>
            <Form.Control
              id='username'
              type="text"
                      required
            />
            <Form.Label htmlFor='password'>Password</Form.Label>
            <Form.Control
              id='password'
              type="password"
              required
            />
          </Form.Group>   
          <Button type="submit" className="mb-2" variant="primary"> Login </Button>
        </Form>
      </Fade>
      <Fade big cascade>
        <div className="row">
          <div className="col"> 
            <a href={guestPath}>Use as guest</a>
          </div>    
          <div className="col"> 
            <a href={registerPath}>No account?</a>
          </div>
        </div>
      </Fade>
    </div>
  )
}

export default LoginHomePage