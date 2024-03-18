import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Pages/Header";
import LoginHomePage from "./Pages/LoginHomePage";
import ReceiveAndSendPage from "./Pages/ReceiveAndSendPage";
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
} from "./Path";
import AccountPage from "./Pages/AccountPage";
import PageNotFound from "./Pages/PageNotFound";
import AlertGuestPage from "./Pages/AlertGuestPage";
import ViewSentVideoPage from "./Pages/ViewSentVideoPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";

function App() {
  return (
    <Router>
      <Header />
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
        <Route element={<PrivateRoute />}>
          <Route path={accountPath} element={<AccountPage />} />
        </Route>
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
