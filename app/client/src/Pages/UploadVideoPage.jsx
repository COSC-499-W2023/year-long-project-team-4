import React, {useState} from 'react'
import {Form,Button, ToggleButtonGroup, ToggleButton} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import { useReactMediaRecorder } from "react-media-recorder";
import {
  viewVideoPath,
} from "../Path"

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState(1);
  const [file, setFile] = useState(null);
  const [disable, setDisable] = useState(true);
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true });

  const handleSubmit =(e)=>{
    e.preventDefault();
    navigate(viewVideoPath,{state:{file:file}});
   };

   const handleChange = (event) => {
    try {
    setFile(URL.createObjectURL(event.target.files[0]));
    //post request
    } catch(error) {
      setFile(null);
    }
  };

  const handleRecord = (mediaContent) => {
    try {
      setFile(mediaContent);
      setDisable(false);
      console.log("Media Blob URL:", mediaBlobUrl);
    } catch(error) {
      setFile(null);
      setDisable(true);
    }

  }

  return (
    <div className="position-absolute top-50 start-50 translate-middle text-center">
      <ToggleButtonGroup className="pb-5" type="radio" name="options" defaultValue={1}>
        <ToggleButton id="tbg-radio-1" value={1} onClick={()=>setType(1)}>
          Upload Video
        </ToggleButton>
        <ToggleButton id="tbg-radio-2" value={2} onClick={()=>setType(2)}>
          Record Video
        </ToggleButton>
      </ToggleButtonGroup>
      <>
      {type===1? 
      (
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFileLg" className="d-grid gap-2">
          <Form.Label className="display-4 " >Upload Video</Form.Label>
          <Form.Control 
            type="file" 
            required 
            class="p-2 bg-light border" 
            accept="video/*" 
            size="lg" 
            onChange={handleChange}
          />
          <div>
            {file===null ? 
            (
            <>
            </>
            ):(
              <video 
                src={file}
                width="500" 
                height="400" 
                controls
              /> 
            )}
          </div>
        </Form.Group>
        <Button type="submit">Upload file</Button>
      </Form>
      ):
      (
      <>
      <Form onSubmit={handleSubmit}>
        <p>{status}</p>
        <div className="mb-2"> 
          <Button onClick={startRecording}>Start Recording</Button> {' '}
          <Button onClick={stopRecording}>Stop Recording</Button>
        </div> 
        <>
         {file=== null? 
         (
         <>
         </>
         ):(
          <video width="500" height="400" controls>
            <source src={file} type="video/mp4"/>
          </video>  
         )}
        </>
        <div className="mb-2">
          <Button onClick={()=>{handleRecord(mediaBlobUrl)}}>Upload file</Button> {' '}
          <Button type="submit" disabled={disable}>Send video</Button>
        </div> 
      </Form>   
      </>
      )
      }
      </>
    </div>
  )
}

export default UploadVideoPage