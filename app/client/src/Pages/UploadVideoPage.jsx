import React, {useState} from 'react'
import {Form,Button, ToggleButtonGroup, ToggleButton} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import Webcam from 'react-webcam';
import {viewVideoPath} from "../Path"
import record from "../Assets/record-btn.svg"
const UploadVideoPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState(1);
  const [file, setFile] = useState(null);
  const [disable, setDisable] = useState(true);
  const [disableRecord, setDisableRecord] = useState(false);
  const webcamRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
    
  const handleStartRecord = React.useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm"
      });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
      );
    mediaRecorderRef.current.start();
    }, [webcamRef, setCapturing, mediaRecorderRef]);
    
    const handleDataAvailable = React.useCallback(
      ({ data }) => {
        if (data.size > 0) {
          setRecordedChunks((prev) => prev.concat(data));
        }
      },
      [setRecordedChunks]
    );
    const handleStopRecord = React.useCallback(() => {
      setDisableRecord(true);
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleSubmit =(e)=>{
    e.preventDefault();
    navigate(viewVideoPath,{state:{file:file}});
   };

   const handleChange = (event) => {
    try {
    setFile(URL.createObjectURL(event.target.files[0]));
    } catch(error) {
      setFile(null);
    }
  };

  const handleRetake = () => {
    setFile(null);
    setCapturing(false);
    setDisableRecord(false);
  }

  const handleRecord = (mediaContent) => {
    try {
      const mediablob = new Blob(mediaContent,{type: "video/mp4"});
      setFile(URL.createObjectURL(mediablob));
      setDisable(false);
      console.log("Media Blob URL:", mediablob);
    } catch(error) {
      console.log(error);
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
          <Form.Label className="display-4 text-white">Upload Video</Form.Label>
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
                className="record"
                src={file}
                width="640" 
                height="360" 
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
        <div className="mb-2"> 
        {capturing? 
          ( <>
              <Button variant= "danger" active>
                <img width="16" height="22" src={record}/> 
              </Button> {' '}
              <Button onClick={handleStopRecord}>Stop Recording</Button>
            </>
          ):(
            <> 
              <Button variant= "secondary" active>
                <img width="16" height="22" src={record}/> 
              </Button> {' '}
              <Button onClick={handleStartRecord} disabled={disableRecord}>Start Recording</Button>
            </> 
          )
        }
        </div> 
        <>
         {file === null? 
         (
          <Webcam  width="640" height="360" audio={true} ref={webcamRef}/>
         ):(
          <video  width="640" height="360" controls>
            <source src={file} type="video/mp4"/>
          </video>  
         )}
        </>
        <div className="mb-2">
          <Button onClick={()=>{handleRecord(recordedChunks)}}>Upload file</Button> {' '}
          <Button onClick={()=>{handleRetake()}} disabled={disable}>Retake recording</Button> {' '}
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