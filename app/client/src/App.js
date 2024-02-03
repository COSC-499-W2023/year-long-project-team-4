import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginHomePage from "./Pages/LoginHomePage";
import ReceiveAndSendPage from "./Pages/ReceiveAndSendPage";
import UploadVideoPage from "./Pages/UploadVideoPage";
import ViewVideoPage from "./Pages/ViewVideoPage";
import RegisterPage from "./Pages/RegisterPage";
import HomePage from "./Pages/HomePage";
import { Navbar, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import person from "./Assets/person.svg";
import "./app.css";
import {
  homePath,
  loginPath,
  guestPath,
  receiveAndSendPath,
  registerPath,
  viewVideoPath,
  uploadVideoPath,
  accountPath,
} from "./Path";
import AccountPage from "./Pages/AccountPage";
import PageNotFound from "./Pages/PageNotFound";
import AlertGuestPage from "./Pages/AlertGuestPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          "${process.env.REACT_APP_IP_ADDRESS}/auth/currentuser",
          {
            withCredentials: true,
          }
        );

        if (response.data.username) {
          setCurrentUser(response.data.username);
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
    <Router>
      <Navbar bg="primary">
        <Navbar.Brand href={homePath}>
          <div className=" m-2 display-6">SafeMov</div>
        </Navbar.Brand>
        <>
          {currentUser ? (
            <Navbar.Collapse className="justify-content-end">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Account Page</Tooltip>}
              >
                <Button className="m-2" href={accountPath}>
                  <img width="50" height="50" src={person} />{" "}
                </Button>
              </OverlayTrigger>
            </Navbar.Collapse>
          ) : (
            <></>
          )}
        </>
      </Navbar>
      <Routes>
        <Route path={homePath} element={<HomePage />} />
        <Route path={loginPath} element={<LoginHomePage />} />
        <Route path={guestPath} element={<AlertGuestPage />} />
        <Route path={receiveAndSendPath} element={<ReceiveAndSendPage />} />
        <Route path={uploadVideoPath} element={<UploadVideoPage />} />
        <Route path={viewVideoPath} element={<ViewVideoPage />} />
        <Route path={registerPath} element={<RegisterPage />} />
        <Route path={accountPath} element={<AccountPage />} />
        {/*Creating a Route element if no Route Path matches*/}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
