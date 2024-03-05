import React, {useState} from 'react'
import { Button, Form, InputGroup} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
    loginPath,
    IP_ADDRESS,
  } from "../Path";
import axios from 'axios'
import {Fade} from 'react-reveal';
import {ReactComponent as See} from '../Assets/eye.svg';
import {ReactComponent as UnSee} from '../Assets/eye-slash.svg';


const RegisterPage = () => {
  const [type, setType] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

const handleSignup = async (firstname, lastname, email, password) => {
  const formData = new FormData();
  formData.append('firstname', firstname);
  formData.append('lastname', lastname);
  formData.append('email', email);
  formData.append('password', password); // Add other form details as needed.
  
try {
  const response = await axios({
    method: 'post',
    url: `${IP_ADDRESS}/auth/signup`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const data = response.data;

  if (data.email) {
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
    const firstname = e.target.elements[0].value; 
    const email = e.target.elements[1].value;
    const lastname = e.target.elements[2].value;
    const password = e.target.elements[3].value;  // Assuming the second input is the password
    handleSignup(firstname,lastname, email, password);
};

  return (
  <div className="position-absolute top-50 start-50 translate-middle text-center">          
    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <Fade cascade>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="p-3">
        <div className="row">
          <div className="col">
            <Form.Label htmlFor='firstname'>First Name</Form.Label>
            <Form.Control
              id='firstname'
              type="text"
              required
            />
            <Form.Label>Email</Form.Label>
            <Form.Control
              id='email'
              type="email"
              required
            />
          </div>
          <div className="col">
          <Form.Label>Last Name</Form.Label>
            <Form.Control
              id='username'
              type="text"
              required
            />
            <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={type ? "text" : "password"}
                  required
                />
                <Button 
                  variant="primary" 
                  onClick={()=> setType(!type)}
                >
                  {!type? <See fill={"white"}/> :<UnSee fill={"white"}/>}
                </Button>
              </InputGroup>
          </div>     
          <Button className="m-2" variant="primary" type="submit"> Register </Button>
          </div>
        </Form.Group>  
        </Form>
        <a className="text-primary"href={loginPath}>Have an account?</a>
      </Fade>
  </div>
  )
}

export default RegisterPage