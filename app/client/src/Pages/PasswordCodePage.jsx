import React from 'react'
import {useState} from "react";
import { Container,Form,InputGroup,Button,Alert, CloseButton } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { IP_ADDRESS, loginPath } from '../Path'
import {ReactComponent as See} from '../Assets/eye.svg';
import {ReactComponent as UnSee} from '../Assets/eye-slash.svg';
import axios from "axios";
import PasswordCheckList from "react-password-checklist";

const PasswordCodePage = () => {
  const navigate = useNavigate();
  const [pass, setPass] = useState('');
  const [type, setType] = useState(false);
  const [show,setShow] = useState(true);
  const [errorMessage,setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const passcode = e.target.elements[0].value;
    const email = e.target.elements[1].value;  
    const password = pass; 
   
    handleReset(passcode, email, password);
  }

  const handleReset = async(passcode, email, password) => {
  try {
    await axios.post(`${IP_ADDRESS}/bucket/change_password_forgot`, {
         input_code: passcode,
         email: email,
         new_password: password,
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
    <Container className="position-absolute top-50 start-50 translate-middle">
        {errorMessage ? (
        <Alert show={show} variant="danger">
          <div className="d-flex justify-content-end">
              <CloseButton onClick={() => setShow(false)}/>
          </div>
          {errorMessage}
        </Alert>):(<></>)
        }
        <Form onSubmit={handleSubmit}>
            <div className="text-center display-4"> Enter new Password</div>
            <div> Enter passcode</div>
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
              type="email"
              required
            />
            <div className="mt-2"> Enter new password </div>
            <InputGroup className="mt-2">
                <Form.Control
                type={type ? "text" : "password"}
                required
                value={pass}
                onChange={(e)=>{setPass(e.target.value)}}
                />
                <Button 
                variant="primary" 
                onClick={()=> setType(!type)}
                >
                {!type? <See fill={"white"}/> :<UnSee fill={"white"}/>}
                </Button>
            </InputGroup>
            <PasswordCheckList
                className='pt-3'
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
            <Button className="mt-4" type="submit">Enter</Button>
        </Form>
    </Container>
  )
}

export default PasswordCodePage