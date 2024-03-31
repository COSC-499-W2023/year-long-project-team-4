import React, {useState, useEffect} from 'react';
import {Card, Col, Button, Row, ListGroup, Tab, Form, Modal, Tabs, InputGroup} from 'react-bootstrap';
import { homePath, viewSentVideoPath } from '../Path';
import {Fade} from 'react-reveal';
import axios from 'axios';
import see from '../Assets/eye.svg';
import unSee from '../Assets/eye-slash.svg';
import {useNavigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import {
    MessagingPath,
    IP_ADDRESS,
  } from "../Path";
import "./AccountPage.css";


const AccountPage = () => {
const [type, setType] = useState(false)
const [currentUser, setCurrentUser] = useState(null);
const [errorMessage, setErrorMessage] = useState("");
const [key, setKey] = useState('account');
const navigate = useNavigate();

const handleSubmit = (e) => {
    e.preventDefault();
    const firstname = e.target.elements[0].value;
    const lastname = e.target.elements[1].value;
    const email = e.target.elements[2].value;
  }
const handleDelete = () =>{
  navigate(homePath);
}

const sendMain = () => {
  navigate(viewSentVideoPath);
}
const firstName = "firstname123";
const lastName = "lastname123";
const email = currentUser;

useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
              const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
                withCredentials: true
              });
        
              if (response.data.email) {
                setCurrentUser(response.data.email);
              if (response.data.email) {
                setCurrentUser(response.data.email);
              } else {
                console.error('No user currently logged in');
              }
            }
            } catch (error) {
              console.error('There was an error fetching the current user', error);
            }
          fetchCurrentUser();
}});

const handleStartChat = (e, videoName) => {
  e.preventDefault();
  navigate(MessagingPath, { state: { videoName: videoName } });
};

return (
  <Fade cascade>
      <Row>
            <Col xs={2}>
                <Fade>
                <Sidebar />
                </Fade>
            </Col>
            <Col xs={10}>
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
                <ListGroup.Item> Email: {email}</ListGroup.Item>
                <ListGroup.Item> First Name: {firstName}</ListGroup.Item>
                <ListGroup.Item> Last Name: {lastName}</ListGroup.Item>
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
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                    />
                  </div>
                  <div className="col">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
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
                        variant="outline-secondary" 
                        onClick={()=> setType(!type)}
                      >
                        {!type? <img src={see}/> :<img src={unSee}/>}
                      </Button>
                    </InputGroup>
                  </div>     
                  <Button className="m-2" variant="primary" type="submit"> Update Account</Button>
                  </div>
              </Form.Group>  
            </Form>
          </Tab>
          <Tab eventKey="delete" title="Delete profile">
            <div className="text-center">
              <div className="display-6 p-1"> Are you sure you want to delete your account? </div>
              <p className="m-3 p-1"> You will no longer be able to access any of the videos you sent or received.</p>
              <Button className="m-3" href={homePath} onClick={()=>{handleDelete()}}> Delete Account</Button>
            </div>
          </Tab>
        </Tabs>
      </Card>
      <div className="text-center">
        <Button className="m-4" onClick={sendMain}> Return to Home </Button>
      </div>
    </Fade>   
   </div>
   </Col>   
    </Row>  
    </Fade>
  )
}

export default AccountPage