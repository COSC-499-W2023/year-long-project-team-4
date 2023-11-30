import React from 'react';
import {Row, Col, Button, ButtonGroup} from 'react-bootstrap';
import { recieveAndSendPath } from '../Path';
const AccountPage = () => {
 
const userName = "username123";
const password = "password122";
const firstName = "firstname123";
const lastName = "lastname123";
const email = "email123@email.com";
const file = "";
return (
   <div>
    <Row>
        <div className="display-4 text-center text-light"> Account Info </div>
        <Col className="p-3">
            <div className="display-6 text-light"> Username: {userName}</div>
            <div className="display-6 text-light"> First Name: {firstName}</div>
            <div className="display-6 text-light"> Last Name: {lastName}</div>
            <div className="display-6 text-light"> Email: {email}</div>
            <div className="display-6 text-light"> Password: {password}</div>
        </Col>
         <Col className="p-3">
             <div className="display-6 text-light"> Videos Viewable</div>
             <video 
                src={file}
                width="320" 
                height="180" 
                controls
            /> 
        </Col>   
    </Row>      
        <div className="text-center p-4">
            <Button href={recieveAndSendPath}> Return to Home</Button>
        </div>
   
   </div>
  )
}

export default AccountPage