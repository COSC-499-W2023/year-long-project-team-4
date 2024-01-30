import React from 'react'
import {useState} from "react";
import { Container,Form,InputGroup,Button,Alert, CloseButton } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { loginPath } from '../Path'
import see from '../Assets/eye.svg';
import unSee from '../Assets/eye-slash.svg';
import axios from "axios";
const PasswordCodePage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState(false);
  const [show,setShow] = useState(true);
  const [errorMessage,setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const passcode = e.target.elements[0].value;
    const email = e.target.elements[1].value;  
    const passwordUpdated = e.target.elements[2].value; 
    console.log(passcode+' '+email+' '+ passwordUpdated);
    handleReset(passcode, email, passwordUpdated);
    navigate(loginPath);
  }

  const handleReset = async(passcode, email, passwordUpdated) => {
  try {
    await axios.post('http://localhost:8080/bucket/change_password_forgot', {
         passcode: passcode,
         email: email,
         passwordUpdated: passwordUpdated,
       }, {
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         withCredentials: true
       });
   } catch (error) {
       if (error.response && error.response.data && error.response.data.error) {
         setErrorMessage(error.response.data.error);
       }
       else {
         setErrorMessage('An error occurred. Please try again.');
       }
     }
    if(errorMessage===''){
      navigate(loginPath);
      }
  }

  
  return (
    <Container className="position-absolute top-50 start-50 translate-middle text-white">
        {errorMessage ? (
        <Alert show={show} variant="danger">
        <div className="d-flex justify-content-end">
            <CloseButton onClick={() => setShow(false)}/>
        </div>
            {errorMessage}
        </Alert>):(<></>)
        }
        <Form onSubmit={handleSubmit}>
            <div className="text-white text-center display-4"> Enter new Password</div>
            <div className="text-white"> Enter passcode</div>
            <InputGroup size="lg" className="mt-2">
                <InputGroup.Text id="inputGroup-sizing-lg">Passcode</InputGroup.Text>
                <Form.Control
                    aria-label="Large"
                    aria-describedby="inputGroup-sizing-sm"
                    required
                />
            </InputGroup>
            <div className="mt-2"> Enter current email </div>
            <Form.Control
              id='email'
              type="email"
              required
            />
            <div className="mt-2"> Enter new password </div>
            <InputGroup size="lg" className="mt-2">
                <Form.Control
                type={type ? "text" : "password"}
                required
                />
                <Button 
                variant="primary" 
                onClick={()=> setType(!type)}
                >
                {!type? <img src={see}/> :<img src={unSee}/>}
                </Button>
            </InputGroup>
            <Button className="mt-4" type="submit">Enter</Button>
        </Form>
    </Container>
  )
}

export default PasswordCodePage