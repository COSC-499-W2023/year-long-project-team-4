import React from 'react'
import {useState} from "react";
import { Container,Form,InputGroup,Button,Alert, CloseButton } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { IP_ADDRESS, loginPath } from '../Path'
import see from '../Assets/eye.svg';
import unSee from '../Assets/eye-slash.svg';
import axios from "axios";
import PasswordCheckList from "react-password-checklist";

const PasswordCodePage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [type, setType] = useState(false);
  const [show,setShow] = useState(true);
  const [errorMessage,setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const passcode = e.target.elements[0].value;
    const email = e.target.elements[1].value;  
    const passwordUpdated = password; 

    handleReset(passcode, email, passwordUpdated);
  }

  const handleReset = async(passcode, email, passwordUpdated) => {
  try {
    await axios.post(`${IP_ADDRESS}/bucket/change_password_forgot`, {
         passcode: passcode,
         email: email,
         passwordUpdated: passwordUpdated,
       }, {
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         withCredentials: true
       });
       navigate(loginPath);
   } catch (error) {
       if (error.response && error.response.data && error.response.data.error) {
         setErrorMessage(error.response.data.error);
       }
       else {
         setErrorMessage('An error occurred. Please try again.');
       }
     }
  }

  
  return (
    <Container className="position-absolute top-50 start-50 translate-middle text-white">
        {errorMessage ? (
        <Alert show={show} variant="danger">
          <div className="d-flex justify-content-end">
              <CloseButton onClick={() => setShow(false)}/>
          </div>
          {errorMessage}
        </Alert>):(<></>)
        }
        <Form onSubmit={handleSubmit}>
            <div className="text-white text-center display-4"> Enter new Password</div>
            <div className="text-white"> Enter passcode</div>
            <InputGroup className="mt-2">
                <InputGroup.Text id="inputGroup-sizing-lg">Passcode</InputGroup.Text>
                <Form.Control
                    aria-label="Large"
                    aria-describedby="inputGroup-sizing-sm"
                    required
                />
            </InputGroup>
            <div className="mt-2"> Enter current email </div>
            <Form.Control
              id='email'
              type="email"
              required
            />
            <div className="mt-2"> Enter new password </div>
            <InputGroup className="mt-2">
                <Form.Control
                type={type ? "text" : "password"}
                required
                value={password}
                onChange={(e)=>{setPassword(e.target.value)}}
                />
                <Button 
                variant="primary" 
                onClick={()=> setType(!type)}
                >
                {!type? <img src={see}/> :<img src={unSee}/>}
                </Button>
            </InputGroup>
            <PasswordCheckList
                className='pt-3'
                rules={["capital", "specialChar", "minLength","maxLength", "number"]}
                minLength={8}
                maxLength={25}
                value={password}
                messages={{
                  minLength: "Password requires at least 8 characters.",
                  maxLength: "Password requires at most 25 characters.",
                  number: "Password must contain at least 1 number.",
                  capital: "Password must contain at least 1 capital letter.",
                  specialChar: "Password must contain at least 1 special character",
                }}
                />
            <Button className="mt-4" type="submit">Enter</Button>
        </Form>
    </Container>
  )
}

export default PasswordCodePage