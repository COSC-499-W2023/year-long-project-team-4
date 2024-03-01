import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginHomePage from "./Pages/LoginHomePage";
import ReceiveAndSendPage from "./Pages/ReceiveAndSendPage";
import UploadVideoPage from "./Pages/UploadVideoPage";
import ViewVideoPage from "./Pages/ViewVideoPage";
import RegisterPage from "./Pages/RegisterPage";
import HomePage from "./Pages/HomePage";
import MessagingPage from "./Pages/MessagingPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import PasswordCodePage from "./Pages/PasswordCodePage";
import {
  Navbar,
  Button,
  OverlayTrigger,
  Modal,
  Tooltip,
} from "react-bootstrap";
import person from "./Assets/person.svg";
import logout from "./Assets/box-arrow-right.svg";
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
  MessagingPath,
  viewSentVideoPath,
  changePasswordPath,
  passwordCodePath,
  resetPasswordPath,
  IP_ADDRESS,
} from "./Path";
import AccountPage from "./Pages/AccountPage";
import PageNotFound from "./Pages/PageNotFound";
import AlertGuestPage from "./Pages/AlertGuestPage";
import ViewSentVideoPage from "./Pages/ViewSentVideoPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";

function App() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(true);

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

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${IP_ADDRESS}/auth/logout`, {
        withCredentials: true, // Important for handling sessions with cookies
      });

      if (response.data.success) {
        // Handle successful logout
        console.log("Logged out successfully");
        setCurrentUser(null);
      } else {
        console.error("Logout error:", response.data.error);
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("There was an error Logging out");
      }
    }
  };

  return (
    <Router>
      <Navbar className="bg-primary">
        <Navbar.Brand href={currentUser ? receiveAndSendPath : homePath}>
          <div className=" m-2 display-6 text-white">SafeMov</div>
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
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Logout</Tooltip>}
              >
                <Button className="m-2" onClick={handleLogout} href={loginPath}>
                  <img width="50" height="50" src={logout} />{" "}
                </Button>
              </OverlayTrigger>
            </Navbar.Collapse>
          ) : (
            <></>
          )}
        </>
      </Navbar>
      {errorMessage && (
        <Modal
          show={modal}
          onHide={() => setModal(false)}
          backdrop="static"
          keyboard={false}
          variant="Danger"
          contentClassName="bg-danger text-white"
        >
          <Modal.Header closeButton>
            <Modal.Title>Error!</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
        </Modal>
      )}
      <Routes>
        <Route path={homePath} element={<HomePage />} />
        <Route path={loginPath} element={<LoginHomePage />} />
        <Route path={guestPath} element={<AlertGuestPage />} />
        <Route path={receiveAndSendPath} element={<ReceiveAndSendPage />} />
        <Route path={uploadVideoPath} element={<UploadVideoPage />} />
        <Route path={viewVideoPath} element={<ViewVideoPage />} />
        <Route path={registerPath} element={<RegisterPage />} />
        <Route path={MessagingPath} element={<MessagingPage />} />
        <Route path={viewSentVideoPath} element={<ViewSentVideoPage />} />
        <Route path={accountPath} element={<AccountPage />} />
        <Route path={changePasswordPath} element={<ForgotPasswordPage />} />
        <Route path={passwordCodePath} element={<PasswordCodePage />} />
        <Route path={resetPasswordPath} element={<ResetPasswordPage />} />
        {/*Creating a Route element if no Route Path matches*/}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
