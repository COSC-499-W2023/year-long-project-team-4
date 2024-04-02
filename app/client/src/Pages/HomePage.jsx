import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Fade} from 'react-reveal';
import { loginPath, receiveAndSendPath,IP_ADDRESS } from '../Path';
import {Button} from 'react-bootstrap';
import { ReactComponent as Logo } from "../Assets/mainLogo.svg";
const HomePage = () => {
  const[user, setCurrentUser] = useState('');
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${IP_ADDRESS}/auth/currentuser`, {
          withCredentials: true,
        });

        if (response.data.email) {
          setCurrentUser(response.data.email);
        } else {
          console.error("No user currently logged in");
        }
      } catch (error) {
        console.error("There was an error fetching the current user", error);
      }
    };

    fetchCurrentUser();
  }, []);
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