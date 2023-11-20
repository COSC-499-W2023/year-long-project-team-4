import React, {useState} from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
    loginPath,
  } from "../Path";
import axios from 'axios'

const RegisterPage = () => {

  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

const handleSignup = async (firstname, lastname, email, username, password) => {
  const formData = new FormData();
  formData.append('firstname', firstname);
  formData.append('lastname', lastname);
  formData.append('email', email);
  formData.append('username', username);
  formData.append('password', password); // Add other form details as needed.

try {
  const response = await axios({
    method: 'post',
    url: 'http://localhost:8080/auth/signup',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const data = response.data;

  if (data.username) {
    console.log('Signup successful');
    navigate(loginPath); // navigate to login after successful registration.
  } else {
    // Set the error message from the response
    setErrorMessage(data.error);
  }
} catch (error) {
  // Check if the error has a response with a specific error message
  if (error.response && error.response.data && error.response.data.error) {
    setErrorMessage(error.response.data.error);
  } else {
    // Set a generic error message for other types of errors
    setErrorMessage('There was an error signing up');
  }
}
};

const handleSubmit = (e) => {
    e.preventDefault();
    const firstname = e.target.elements[0].value;  // Assuming the first input is the username
    const lastname = e.target.elements[1].value;
    const email = e.target.elements[2].value;
    const username = e.target.elements[3].value;
    const password = e.target.elements[4].value;  // Assuming the second input is the password
    handleSignup(firstname,lastname, email, username, password);
};

  return (
  <div className="position-absolute top-50 start-50 translate-middle">          
    <Card border="primary" style={{ width: "16rem" }}>  
      <Card.Body className="text-center">
        <Card.Title>Register</Card.Title>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="p-3">
            <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                required
              />
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                required
              />
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
              />
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
          <Button className="mb-2" variant="primary" type="submit"> Register </Button>
        </Form>
      </Card.Body>
      <Card.Link className="text-center" href={loginPath}>Have an account?</Card.Link>
    </Card>
  </div>
  )
}

export default RegisterPage