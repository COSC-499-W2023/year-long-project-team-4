import React, { useState } from 'react';
import Fade from 'react-reveal';
import {Form,Button,InputGroup} from "react-bootstrap";
import see from '../Assets/eye.svg';
import unSee from '../Assets/eye-slash.svg';
import { useNavigate } from 'react-router-dom';
import { loginPath } from '../Path';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [type, setType] = useState(false);

    const handleSubmit = () =>{
    navigate(loginPath);
    }
  return (
    <Fade big cascade>
        <Form onSubmit={handleSubmit}>
        <Form.Group className="p-3">
            <Form.Label className="display-6"> Enter New Password</Form.Label>
            <InputGroup>
                <Form.Control
                type={type ? "text" : "password"}
                required
                />
                <Button 
                variant="primary" 
                onClick={()=> setType(!type)}
                >
                {!type? <img src={see}/> :<img src={unSee}/>}
                </Button>
            </InputGroup>
            </Form.Group>   
        <Button type="submit" className="m-3" variant="primary"> Login </Button>
        </Form>
  </Fade>
  )
}

export default ResetPasswordPage