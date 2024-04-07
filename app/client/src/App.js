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
import { useState } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <Router>
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Routes>
        <Route path={homePath} element={<HomePage />} />
        <Route
          path={loginPath}
          element={<LoginHomePage setCurrentUser={setCurrentUser} />}
        />
        <Route path={guestPath} element={<AlertGuestPage />} />
        <Route path={uploadVideoPath} element={<UploadVideoPage />} />
        <Route
          path={viewVideoPath}
          element={<ViewVideoPage currentUser={currentUser} />}
        />
        <Route path={registerPath} element={<RegisterPage />} />
        <Route path={MessagingPath} element={<MessagingPage />} />
        <Route
          path={viewSentVideoPath}
          element={<ViewSentVideoPage currentUser={currentUser} />}
        />
        <Route element={<PrivateRoute currentUser={currentUser} />}>
          <Route
            path={accountPath}
            element={
              <AccountPage
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
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
