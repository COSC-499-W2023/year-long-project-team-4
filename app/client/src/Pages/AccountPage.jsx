import React, {useState, useEffect} from 'react';
import {Card, Col, Button, Row, ListGroup, Tab, Form, Modal, Tabs, InputGroup, Alert} from 'react-bootstrap';
import { homePath, viewSentVideoPath, uploadVideoPath} from '../Path';
import {Fade} from 'react-reveal';
import axios from 'axios';
import see from '../Assets/eye.svg';
import unSee from '../Assets/eye-slash.svg';
import {useNavigate} from 'react-router-dom';
import Sidebar from './Sidebar';
import {
    MessagingPath,
    IP_ADDRESS,
    loginPath,
  } from "../Path";
import "./AccountPage.css";

import PasswordCheckList from "react-password-checklist";

const AccountPage = ({currentUser, setCurrentUser}) => {
const [type, setType] = useState(false)
const [currentFirstName, setCurrentFirstName] = useState(null);
const [currentLastName, setCurrentLastName] = useState(null);
const [errorMessage, setErrorMessage] = useState("");
const [pass, setPass] = useState("");
const [key, setKey] = useState('account');
const navigate = useNavigate();
const [isAuthenticated, setIsAuthenticated] = useState(false);

const handleSubmit = (e) => {
    e.preventDefault();
    const firstname = e.target.elements[0].value;
    const lastname = e.target.elements[1].value;
    const email = e.target.elements[2].value;
    const password = pass;
    handleUpdate(firstname,lastname,email,password);
  }
const handleUpdate =(firstname,lastname,email,password) => {
  const formData = new FormData();
  formData.append('firstname',firstname);
  formData.append('lastname',lastname);
  formData.append('email', email);
  
  const passwordFormData = new FormData();
  passwordFormData.append('new_password', password);
  try {
    axios.post(
    `${IP_ADDRESS}/auth/updateinfo`, 
      formData,
      {
      withCredentials: true,
      headers: {
          'Content-Type': 
          'multipart/form-data'
        }
      },
      );

      axios.post(
        `${IP_ADDRESS}/bucket/change_password_reencrypt`,
        passwordFormData,
        {
          withCredentials: true,
          headers: {
              'Content-Type': 
              'multipart/form-data'
            }
          },
        ).then(response=>{
          response.data.email? setKey('account'): setErrorMessage(response.data.error)
        });

  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      console.log(error)
      setErrorMessage(error.response.data.error);
    } else {
      // Set a generic error message for other types of errors
      console.log(error)
      setErrorMessage('There was an error signing up');
    }
  }
}

const handleDelete = () => {
  axios.post(
    `${IP_ADDRESS}/auth/deleteaccount`, 
    null,
    {
      withCredentials: true,
    }
  )
  .then(response => {
    if (response.status === 200) {
      navigate(homePath);
    } else {
      console.log(response);
      setErrorMessage('There was an error deleting your account');
    }
  })
  .catch(error => {
    if (error.response && error.response.data && error.response.data.error) {
      console.log(error);
      setErrorMessage(error.response.data.error);
    } else {
      console.log(error);
      setErrorMessage('There was an error deleting your account');
    }
  });
};

const sendMain = () => {
  navigate(viewSentVideoPath);
}

const email = currentUser;

useEffect(()=>{
  const fetchCurrent =async()=> {
    try {
      const response = await axios.get(`${IP_ADDRESS}/auth/userdetails`, {
        withCredentials: true
      });
      console.log(response);
      if (response.data.email) {
        setCurrentUser(response.data.email);
        setCurrentFirstName(response.data.firstname);
        setCurrentLastName(response.data.lastname);
        setIsAuthenticated(true);
      } else {
        console.error('No user currently logged in');
      }
    } catch (error) {
        navigate(uploadVideoPath);
        console.error('There was an error fetching the current user', error);
        setIsAuthenticated(false);
    }
  };
  fetchCurrent();}, [])


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
        {errorMessage? (<Alert>{errorMessage}</Alert>):(<></>)}
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
                <ListGroup.Item> First Name: {currentFirstName}</ListGroup.Item>
                <ListGroup.Item> Last Name: {currentLastName}</ListGroup.Item>
              </ListGroup>
            </Col>
          </Tab>
          <Tab eventKey="update" title="Update profile">
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <div className="display-6 text-center mb-2"> Update Profile Info </div>
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">First Name</InputGroup.Text>
                      <Form.Control
                        type="text"
                        value={currentFirstName}
                        onChange={(e)=>{setCurrentFirstName(e.target.value)}}
                        required
                      />
                    </InputGroup>
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">Last Name</InputGroup.Text>
                      <Form.Control
                        type="text"
                        value={currentLastName}
                        onChange={(e)=>{setCurrentLastName(e.target.value)}}
                        required
                      />
                     </InputGroup> 
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">Email</InputGroup.Text>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e)=>{setCurrentUser(e.target.value)}}
                        required
                      />
                    </InputGroup>
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">Password</InputGroup.Text>
                      <Form.Control
                        type={type ? "text" : "password"}
                        required
                        value={pass}
                        onChange={(e)=>{setPass(e.target.value)}}
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={()=> setType(!type)}
                      >
                        {!type? <img src={see}/> :<img src={unSee}/>}
                      </Button>
                    </InputGroup>
                    <PasswordCheckList
                      className='p-2'
                      rules={["capital", "specialChar", "minLength","maxLength", "number"]}
                      minLength={8}
                      maxLength={25}
                      value={pass}
                      messages={{
                        minLength: "Password requires at least 8 characters.",
                        maxLength: "Password requires at most 25 characters.",
                        number: "Password must contain at least 1 number.",
                        capital: "Password must contain at least 1 capital letter.",
                        specialChar: "Password must contain at least 1 special character",
                      }}
                    />    
                  <Button className="m-2" variant="primary" type="submit"> Update Account</Button>
              </Form.Group>  
            </Form>
          </Tab>
          <Tab eventKey="delete" title="Delete profile">
            <div className="text-center">
              <div className="display-6 p-1"> Are you sure you want to delete your account? </div>
              <p className="m-3 p-1"> You will no longer be able to access any of the videos you sent or received.</p>
              <Button className="m-3" onClick={()=>{handleDelete()}}> Delete Account</Button>
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