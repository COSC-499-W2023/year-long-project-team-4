import React from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
    loginPath,
  } from "../Path";
const RegisterPage = () => {

  const navigate = useNavigate();
  
  const handleSubmit =(e)=>{
    e.preventDefault();
    navigate(loginPath);
   };

  return (
    <div className="position-absolute top-50 start-50 translate-middle">          
    <Card border="primary" style={{ width: "16rem" }}>  
      <Card.Body className="text-center">
        <Card.Title as="h1">Register</Card.Title>
        <Form>
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
          <Button className="mb-2" variant="primary" type="submit"> Register </Button>
        </Form>
      </Card.Body>
      <Card.Link className="text-center" href={loginPath}>Have an account?</Card.Link>
    </Card>
  </div>
  )
}

export default RegisterPage