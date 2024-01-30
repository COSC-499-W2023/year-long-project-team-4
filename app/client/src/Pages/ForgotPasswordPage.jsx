import React, { useState } from 'react'
import { Alert, Button, CloseButton, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {passwordCodePath} from "../Path";
import {Fade} from "react-reveal";
const ForgotPasswordPage = () => {
    const [errorMessage,setErrorMessage] = useState('');
    const navigate = useNavigate();
    const [show,setShow] = useState(true);
    const handleSubmit = (e) => {
      e.preventDefault();
      const email = e.target.elements[0].value;
      handleReset(email);
    }
    
    const handleReset = async(email) =>{
        try {
            await axios.post('http://localhost:8080/bucket/set_verificationcode', {
             email: email
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
          navigate(passwordCodePath);
          }
    }

  return (
    <Fade>
        {errorMessage ? (
        <Alert show={show} variant="danger">
        <div className="d-flex justify-content-end">
            <CloseButton onClick={() => setShow(false)}/>
        </div>
            {errorMessage}
        </Alert>):(<></>)
        }
        <Container className="pt-4">
            <Alert show={show} variant="danger">
                <div className="d-flex justify-content-end">
                    <CloseButton onClick={() => setShow(false)}/>
                </div>
                <Alert.Heading>Are you sure you want to reset password?</Alert.Heading> 
                Note that you will no longer have
                access to the videos saved on your
                account if you change your password.
            </Alert>
            <Form onSubmit={handleSubmit} className="text-center">
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label className="text-white">Enter Email for send code to reset password:</Form.Label>
                    <Form.Control type="email"/>
                </Form.Group>
                <Button type="submit">Enter</Button>
            </Form>
        </Container>
    </Fade>
  )
}

export default ForgotPasswordPage