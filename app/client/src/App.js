import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Pages/Header";
import LoginHomePage from "./Pages/LoginHomePage";
import UploadVideoPage from "./Pages/UploadVideoPage";
import ViewVideoPage from "./Pages/ViewVideoPage";
import RegisterPage from "./Pages/RegisterPage";
import HomePage from "./Pages/HomePage";
import MessagingPage from "./Pages/MessagingPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import PasswordCodePage from "./Pages/PasswordCodePage";
import axios from "axios";
import "./app.css";
import PrivateRoute from "./PrivateRoute";
import {
  homePath,
  loginPath,
  guestPath,
  registerPath,
  viewVideoPath,
  uploadVideoPath,
  accountPath,
  MessagingPath,
  viewSentVideoPath,
  changePasswordPath,
  passwordCodePath,
} from "./Path";
import AccountPage from "./Pages/AccountPage";
import PageNotFound from "./Pages/PageNotFound";
import AlertGuestPage from "./Pages/AlertGuestPage";
import ViewSentVideoPage from "./Pages/ViewSentVideoPage";
import { useEffect, useState } from "react";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/auth/currentuser",
          {
            withCredentials: true,
          }
        );

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
    <Router>
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
      <Routes>
        <Route path={homePath} element={<HomePage />} />
        <Route
          path={loginPath}
          element={<LoginHomePage setCurrentUser={setCurrentUser} />}
        />
        <Route path={guestPath} element={<AlertGuestPage />} />
        <Route path={uploadVideoPath} element={<UploadVideoPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>} />
        <Route path={viewVideoPath} element={<ViewVideoPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>} />
        <Route path={registerPath} element={<RegisterPage />} />
        <Route
          path={MessagingPath}
          element={
            <MessagingPage
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              isCollapsed={isCollapsed}/>
          }
        />
        <Route path={viewSentVideoPath} element={<ViewSentVideoPage isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>} />
        <Route element={<PrivateRoute currentUser={currentUser} />}>
          <Route
            path={accountPath}
            element={
              <AccountPage
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
        </Route>
        <Route path={changePasswordPath} element={<ForgotPasswordPage />} />
        <Route path={passwordCodePath} element={<PasswordCodePage />} />
        {/*Creating a Route element if no Route Path matches*/}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
