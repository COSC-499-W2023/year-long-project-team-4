import React from 'react'
import { useLocation } from 'react-router-dom';

const ViewVideoPage = () => {
  const location =useLocation();
  try {
    return (
      <div className="position-absolute top-50 start-50 translate-middle">
        <div className="text-center display-4 d-grid gap-2">
          Video's Sent
        </div>
        <video 
          src={location.state.file}
          width="500" 
          height="400" 
          controls
        />
      </div>
      )
  } catch(error)
  {
    return (
      <div className="position-absolute top-50 start-50 translate-middle text-center display-4">
          No videos to display
      </div>
      )
  }
}

export default ViewVideoPage