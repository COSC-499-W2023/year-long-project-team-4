import React, {useState} from 'react'
import { Button, Container, Form, InputGroup, Modal} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
    loginPath,
    IP_ADDRESS,
  } from "../Path";
import axios from 'axios'
import {Fade} from 'react-reveal';
import {ReactComponent as See} from '../Assets/eye.svg';
import {ReactComponent as UnSee} from '../Assets/eye-slash.svg';
import PasswordCheckList from "react-password-checklist"; 



const RegisterPage = () => {
  const [type, setType] = useState(false);
  const [password, setPassword] = useState('');
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
    setEmail(email);
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
    const lastname = e.target.elements[1].value;
    const email = e.target.elements[2].value;
    const password = e.target.elements[3].value;  // Assuming the second input is the password
    handleSignup(firstname,lastname, email, password);
};

  return (
  <Container>
  <div className="p-3 text-center">          
    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <Fade cascade>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="p-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              data-testid='Firstname'
              id='Firstname'
              type="text"
              required
            />
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              data-testid="Lastname"
              id='Lastname'
              type="text"
              required
            />
            <Form.Label>Email</Form.Label>
            <Form.Control
              data-testid="Email"
              id='Email'
              type="email"
              required
            />        
            <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  data-testid="Password"
                  id="Password"
                  type={type ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e)=>{setPassword(e.target.value)}}
                />
                <Button 
                  variant="primary" 
                  onClick={()=> setType(!type)}
                  aria-label='pass'
                >
                  {!type? <See fill={"white"}/> :<UnSee fill={"white"}/>}
                </Button>
              </InputGroup>
              <PasswordCheckList
                className='pt-3'
                rules={["capital", "specialChar", "minLength","maxLength", "number"]}
                minLength={8}
                maxLength={25}
                value={password}
                messages={{
                  minLength: "Password requires at least 8 characters.",
                  maxLength: "Password requires at most 25 characters.",
                  number: "Password must contain at least 1 number.",
                  capital: "Password must contain at least 1 capital letter.",
                  specialChar: "Password must contain at least 1 special character.",
                }}
                />
          <Button className="m-2" variant="primary" type="submit"> Register </Button>
        </Form.Group>  
        </Form>
        <div><a className="text-primary" href="#!" onClick={() => setShowVerification(true)}>Have a Verification Code?</a></div>
        <div><a className="text-primary" href={loginPath}>Have an account?</a></div>
      </Fade>
      {/* Verification Modal */}
      <Modal show={showVerification} onHide={() => setShowVerification(false)} backdrop="static">
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
          <Button aria-label="closeButton"variant="secondary" onClick={() => setShowVerification(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleVerification(verificationCode)}
          disabled={!email.trim() || !verificationCode.trim()}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
  </div>
  </Container>  
  )
}

export default RegisterPage