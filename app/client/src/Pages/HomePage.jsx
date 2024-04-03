import React from 'react';
import {Fade} from 'react-reveal';
import { loginPath } from '../Path';
import {Button} from 'react-bootstrap';
import { ReactComponent as Logo } from "../Assets/mainLogo.svg";
const HomePage = () => {
  return ( 
    <div className="position-absolute top-50 start-50 translate-middle text-center">          
       <Fade>
            <div className="display-3">
              <Logo/>
            </div>
            <div className="display-6 p-4">
                A secure and anonymous platform for video submission 
            </div>
            <Button className="p-4" href={loginPath}>Get Started</Button>
       </Fade> 
    </div>
  )
}

export default HomePage