import React, {useState} from 'react'
import { Button, Form, InputGroup, Modal} from 'react-bootstrap';
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
  const [modalErrorMessage, setModalErrorMessage] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  const handleVerification = async (verificationCode) => {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('input_code', verificationCode);

    try {
      const response = await axios.post(`${IP_ADDRESS}/auth/confirm_user`, formData);

      if (response.data.status === 'success') {
        console.log('Email verified');
        navigate(loginPath); // navigate to login after successful verification.
      } else {
        setModalErrorMessage(response.data.message);
      }
    } catch (error) {
      setModalErrorMessage('There was an error verifying the email');
    }
  };

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

  if (email) {
    setShowVerification(true); // Show verification input
    console.log('Signup successful');
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
        <div><a className="text-primary" href="#!" onClick={() => setShowVerification(true)}>Have a Verification Code?</a></div>
        <div><a className="text-primary" href={loginPath}>Have an account?</a></div>
      </Fade>
      {/* Verification Modal */}
      <Modal show={showVerification} onHide={() => setShowVerification(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Your Account</Modal.Title>
        </Modal.Header>
        {modalErrorMessage && <div className="alert alert-danger">{modalErrorMessage}</div>}
        <Modal.Body>
          <p>Please enter your email and the verification code sent there.</p>
          <Form.Control
            className="mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Form.Control
            type="text"
            placeholder="Verification Code"
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerification(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleVerification(verificationCode)}
          disabled={!email.trim() || !verificationCode.trim()}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
  </div>
  )
}

export default RegisterPage