import React from 'react'
import {Button} from 'react-bootstrap'
import {
  viewVideoPath,
  uploadVideoPath,
} from "../Path";
const RecieveAndSendPage = () => {
  return (
    <div className="position-absolute top-50 start-50 translate-middle">
       <div className="d-grid gap-2">
        <Button size="lg" href={uploadVideoPath}> Send Videos</Button> {" "}
        <Button size="lg" href={viewVideoPath}> Receive Videos</Button>
      </div>
    </div>
  )
}

export default RecieveAndSendPage