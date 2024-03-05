import React, { useState } from 'react'
import { Alert, Button, CloseButton, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {passwordCodePath} from "../Path";
const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [show,setShow] = useState(true);
    const handleSubmit = () => {
        navigate(passwordCodePath);
    }
    
  return (
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
                <Form.Label>Enter Email for send code to reset password:</Form.Label>
                <Form.Control type="email"/>
            </Form.Group>
            <Button type="submit">Enter</Button>
        </Form>
    </Container>
  )
}

export default ForgotPasswordPage