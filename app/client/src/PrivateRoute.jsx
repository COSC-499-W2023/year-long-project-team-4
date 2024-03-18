import {useEffect, useState} from 'react'
import { Navigate, Outlet} from 'react-router-dom'
import { loginPath, IP_ADDRESS } from './Path'
import axios from 'axios'
const PrivateRoute = () => {
    const [currentUser,setCurrentUser]=useState(null);
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
    currentUser ? <Outlet/> : <Navigate to={loginPath} />
  )
}

export default PrivateRoute