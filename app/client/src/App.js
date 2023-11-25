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
} from "./Path";

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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
