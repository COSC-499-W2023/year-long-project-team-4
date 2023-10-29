import React from 'react'
import {Card, Button, Form} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'
import {
  recieveAndSendPath,
  registerPath,
} from "../Path";
const LoginHomePage = () => {

  const navigate = useNavigate();
  
  const handleSubmit =(e)=>{
    e.preventDefault();
    navigate(recieveAndSendPath);
   };
  
   return (
    <div class="position-absolute top-50 start-50 translate-middle">          
      <Card border="primary" style={{ width: "16rem" }}>  
        <Card.Body class="text-center">
          <Card.Title>Login</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Form.Group class="p-3">
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
              <Button type="submit" className="mb-2" variant="primary"> Login </Button>
            </Form>
        </Card.Body>
        <Card.Link class="text-center"  href={recieveAndSendPath}>Use as guest</Card.Link>
        <Card.Link class="text-center" href={registerPath}>No account?</Card.Link>
      </Card>
    </div>
  )
}

export default LoginHomePage