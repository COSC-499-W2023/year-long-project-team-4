import React from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
  recieveAndSendPath,
  registerPath,
} from "../Path";
const LoginHomePage = () => {
  return (
    <div className="position-absolute top-50 start-50 translate-middle">          
      <Card border="primary" style={{ width: "16rem" }}>  
        <Card.Body className="text-center">
          <Card.Title as="h1">Login</Card.Title>
            <Form.Group className="p-3">
              <Form.Label>Username</Form.Label>
                <Form.Control
                  type="email"
                />
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                />
            </Form.Group>   
          <Button className="mb-2" variant="primary" href={recieveAndSendPath}> Login </Button>
        </Card.Body>
        <Card.Link className="text-center"  href={recieveAndSendPath}>Use as guest</Card.Link>
        <Card.Link className="text-center" href={registerPath}>No account?</Card.Link>
      </Card>
    </div>
  )
}

export default LoginHomePage