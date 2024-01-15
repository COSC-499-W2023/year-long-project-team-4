import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginHomePage from "./Pages/LoginHomePage";
import RecieveAndSendPage from "./Pages/RecieveAndSendPage";
import UploadVideoPage from "./Pages/UploadVideoPage";
import ViewVideoPage from "./Pages/ViewVideoPage";
import RegisterPage from "./Pages/RegisterPage";
import "./app.css";
import {
  loginPath,
  recieveAndSendPath,
  registerPath,
  viewVideoPath,
  uploadVideoPath,
  accountPath,
} from "./Path";
import AccountPage from "./Pages/AccountPage";
import PageNotFound from "./Pages/PageNotFound";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path={loginPath} element={<LoginHomePage />} />
          <Route path={recieveAndSendPath} element={<RecieveAndSendPage />} />
          <Route path={uploadVideoPath} element={<UploadVideoPage />} />
          <Route path={viewVideoPath} element={<ViewVideoPage />} />
          <Route path={registerPath} element={<RegisterPage />} />
          {/*Creating a Route element if no Route Path matches*/}
          <Route path="*" element={<PageNotFound/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
