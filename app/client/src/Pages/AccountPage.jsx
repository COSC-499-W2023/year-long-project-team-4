import React, {useState, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Modal} from 'react-bootstrap';
import { recieveAndSendPath } from '../Path';
import axios from 'axios';

const AccountPage = () => {

const [currentUser, setCurrentUser] = useState(null);

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
   <div>
    <Row>
        <div className="display-4 text-center text-light"> Account Info </div>
        <Col className="p-3">
            <div className="display-6 text-light"> Username: {userName}</div>
            <div className="display-6 text-light"> First Name: {firstName}</div>
            <div className="display-6 text-light"> Last Name: {lastName}</div>
            <div className="display-6 text-light"> Email: {email}</div>
        </Col>
    </Row>      
        <div className="text-center p-4">
            <Button href={recieveAndSendPath}> Return to Home</Button>
        </div>   
   </div>
  )
}

export default AccountPage