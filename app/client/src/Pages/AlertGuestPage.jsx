import React from 'react'
import { Button, Alert } from 'react-bootstrap'
import { Fade } from 'react-reveal'
import { loginPath, recieveAndSendPath } from '../Path'

const AlertGuestPage = () => {
  return (
    <div className="position-absolute top-50 start-50 translate-middle text-center">
        <Fade> 
            <Alert variant="danger">
                Understand, as a guest you will only 
                be able to send videos, not receive them.
                You will also not be able to view the video
                after it is sent.
                If you understand please click continue,
                otherwise click login to be able to access 
                all features of this app.
                <p className="p-2">
                    <Button variant="outline-primary" href={loginPath}>login</Button> {" "}
                    <Button variant="outline-danger" href={recieveAndSendPath}>continue</Button>
                </p>
            </Alert>
        </Fade>     
    </div>
  )
}

export default AlertGuestPage