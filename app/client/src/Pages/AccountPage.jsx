import React, {useState, useEffect} from 'react';
import {Card, Col, Button, Row, ListGroup, Tab, Form, Tabs} from 'react-bootstrap';
import { receiveAndSendPath } from '../Path';
import {Fade} from 'react-reveal';
import axios from 'axios';

const AccountPage = () => {

const [currentUser, setCurrentUser] = useState(null);
const [key, setKey] = useState('account');
const handleSubmit = (e) => {
    e.preventDefault();
    const firstname = e.target.elements[0].value;  // Assuming the first input is the username
    const lastname = e.target.elements[1].value;
    const email = e.target.elements[2].value;
    const username = e.target.elements[3].value;
  }

const userName = currentUser;
const firstName = "firstname123";
const lastName = "lastname123";
const email = "email123@email.com";

useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
              const response = await axios.get('http://localhost:8080/auth/currentuser', {
                withCredentials: true
              });
        
              if (response.data.username) {
                setCurrentUser(response.data.username);
              } else {
                console.error('No user currently logged in');
              }
            } catch (error) {
              console.error('There was an error fetching the current user', error);
            }
          };
        
          fetchCurrentUser();
}, []);

return (
   <div className="container p-4">
    <Fade>
      <Card>
        <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
        >
          <Tab eventKey="account" title="Account Info">
          <div className="display-6 text-center"> Account Info </div>
            <Col className="p-4 fs-5">
              <ListGroup variant="flush">
                <ListGroup.Item> Username: {userName}</ListGroup.Item>
                <ListGroup.Item> First Name: {firstName}</ListGroup.Item>
                <ListGroup.Item> Last Name: {lastName}</ListGroup.Item>
                <ListGroup.Item> Email: {email}</ListGroup.Item>
              </ListGroup>
            </Col>
          </Tab>
          <Tab eventKey="update" title="Update profile">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="p-3">
              <div className="display-6 text-center"> Update Profile Info </div>
                <div className="row m-2">
                  <div className="col">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      required
                    />
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      required
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      required
                    />
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                    />
                  </div>     
                  <Button className="m-2" variant="primary" type="submit"> Update Account</Button>
                  </div>
              </Form.Group>  
            </Form>
          </Tab>
        </Tabs>
      </Card>
      <div className="text-center">
        <Button className="m-2" href={receiveAndSendPath}> Return to Home </Button>
      </div>
    </Fade>   
   </div>
  )
}

export default AccountPage