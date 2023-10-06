import React from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {
    loginPath,
  } from "../Path";
const RegisterPage = () => {
  return (
    <div class="position-absolute top-50 start-50 translate-middle">          
    <Card border="primary" style={{ width: "16rem" }}>  
      <Card.Body class="text-center">
        <Card.Title>Register</Card.Title>
          <Form.Group class="p-3">
            <Form.Label>Username</Form.Label>
              <Form.Control
                type="email"
              />
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
              />
          </Form.Group>   
        <Button className="mb-2" variant="primary" href={loginPath}> Register </Button>
      </Card.Body>
      <Card.Link class="text-center" href={loginPath}>Have an account?</Card.Link>
    </Card>
  </div>
  )
}

export default RegisterPage