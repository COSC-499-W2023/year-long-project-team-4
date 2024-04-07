import React, {useState, useEffect} from 'react'
import {Container, Row, Alert, Form, Offcanvas, Modal, Button, ToggleButtonGroup, Spinner, ToggleButton, Col} from 'react-bootstrap'
import Webcam from 'react-webcam';
import  {ReactComponent as Record} from "../Assets/record-btn.svg"
import axios from "axios";
import info from "../Assets/info-circle.svg"
import { Fade } from 'react-reveal';
import { IP_ADDRESS , viewSentVideoPath} from '../Path';
import Sidebar from './Sidebar';
import ysfixWebmDuration from "fix-webm-duration";
import { useNavigate } from 'react-router-dom';
import "./UploadVideoPage.css";

const UploadVideoPage = ({isCollapsed}) => {
  const [type, setType] = useState(1);
  const [time, setTime] = useState(0);
  const [backend, setBackend] = useState(null);
  const [disable, setDisable] = useState(true);
  const [disableRecord, setDisableRecord] = useState(false);
  const webcamRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const [load, setLoad] = useState(false);
  const [modal, setModal] = useState(true);

  const [file, setFile] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState([]);
  const [retentionPeriod, setRetentionPeriod] = useState(90);
  const [videoName, setVideoName] = useState('');
  const [isMobile, setIsMobile] = useState(false)

  let startTime;
  var duration;
  const navigate = useNavigate()
  const width = 400; 
  const height = 225;

  const handleResize = () => {
    if (window.innerWidth < 720) {
        setIsMobile(true)
    } else {
        setIsMobile(false)
    }
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize)
  })

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && tagsInput.trim()) {
      setTags([...tags, tagsInput.trim()]);
      setTagsInput(''); // Reset input field to empty string
      event.preventDefault();
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleClose = () => setShow(false);
  
  const handleShow = () => setShow(true);  

  const handleType = (typeNumber) => {
    setType(typeNumber);
    setFile(null);
  }

  const handleStartRecord = React.useCallback(() => {
    setCapturing(true);
    startTime = Date.now();
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

  const handleStopRecord =  React.useCallback(() => {
      duration = Date.now() - startTime;
      setDisableRecord(true);
      setTime(duration);
      mediaRecorderRef.current.stop();
      
      setCapturing(false);

  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleSubmit =(e)=>{
    e.preventDefault();
    
    const videoData = new FormData();

    // Appends the video file and recipient's email to the FormData object
    videoData.append('video_name', videoName);
    videoData.append('file', backend, 'videoFile.mp4');
    videoData.append('recipient', recipientEmail);

    const tagsPayload = { tags }; // Ensure the payload structure is correct
    videoData.append('json', new Blob([JSON.stringify(tagsPayload)], { type: "application/json" }));
  
    axios.post(`${IP_ADDRESS}/bucket/upload`, videoData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
  })
  .then(response => {
    console.log('Video uploaded successfully', response.data);
    setUploadSuccess(true);
    navigate(viewSentVideoPath);
  })
  .catch(error => {
    console.error('Error uploading video', error);
  });
   };

   const handleChange = (event) => {
    try {
    setBackend(event.target.files[0]);
    setFile(URL.createObjectURL(event.target.files[0]));
    } catch(error) {
      setFile(null);
    }
  };

  const handleRetake = () => {
    setFile(null);

    setRecordedChunks([]);

    setCapturing(false);
    
    setDisableRecord(false);
  }

  const handleRecord = async(mediaContent) => {
    try {
      const mediablob = new Blob(mediaContent,{type: "video/mp4"});
      const fixedblob = await ysfixWebmDuration(mediablob,time,{logger:false});
      setBackend(fixedblob);
      setFile(URL.createObjectURL(fixedblob));
      
      setDisable(false);

    } catch(error) {
      console.log(error);
      setFile(null);
      setDisable(true);
    }
  }

  // Calls handleRecord() when the data is ready in place of the old "preview video" button
  useEffect(() => {
      if (recordedChunks.length > 0) {
        console.log(recordedChunks);
        handleRecord(recordedChunks);
      }
    }, [recordedChunks]
  );

  const handleBlur = () => {
    const videoData = new FormData();
    setLoad(true);
    videoData.append('file', backend, 'videoFile.mp4');
    axios.post(`${IP_ADDRESS}/bucket/blurRequest`, videoData, { responseType: 'arraybuffer' })
    .then((response) => {
      const mediablob = new Blob([response.data], { type: "video/mp4" });
      setBackend(mediablob);
      setFile(URL.createObjectURL(mediablob));
      setLoad(false);
    })
    .catch(error => {
      console.error('Error blurring video', error);
    });
    } 

  return (
  <>
<Container fluid>
  
      <Button className="m-2 float-end" variant="outline-dark" onClick={handleShow}>
        <img src={info}></img>
      </Button>
    
    <Offcanvas show={show} onHide={handleClose} backdrop="static" placement="end">
      <Offcanvas.Header closeButton>
            <Offcanvas.Title>How Uploading Videos Works</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <p>
          To send a video you have 2 options.
          Option 1 is to upload a video, or 
          Option 2, to record a video on the 
          webapp.
        </p> 
        <p>  
          Option 1 requires you to do the following:
          <ul>
            <li>
              1. upload a video file, where 
              a preview will show up. If 
              satisfied, enter the email
              of the user you wish to send
              to then click send video to 
              send the file.  
            </li>
            <li>
              2. If not happy with the video, 
              simply click upload video to 
              retry with another file, following 
              step 1 above.
            </li>
            <li>
              3. Once done, you must fill out some basic
              user info such as the name of the video, 
              the recipient's email, the rentention 
              of the video in days, and any tags related to
              the video. 
            </li>
          </ul>    
        </p>
        <p>
          Option 2 requires you to do the following:
          <ul>
            <li>
              1. record a video using your camera. 
              Simply click start record on the 
              top and click stop record when done.  
            </li>
            <li>
              2. To preview the video, click 
              preview video. If satisfied, 
              enter the recipient's email, 
              and click send video. If not, 
              click retake video, and 
              repeat step 1 and 2. 
            </li>
            <li>
              3. Once done, you must fill out some basic
              user info such as the name of the video, 
              the recipient's email, the rentention 
              of the video in days, and any tags related to
              the video!
            </li>
          </ul> 
        </p>
        <p>
          When done, you have the option to
          blur your video. If you choose to,
          the video will be become blurred!
          Once satisified you can send the video
          where it will be viewable in videos uploaded.
        </p>
      </Offcanvas.Body>
    </Offcanvas>
   
    </Container>
    {uploadSuccess && 
    <Modal 
      show={modal}
      onHide={()=>navigate(viewSentVideoPath)}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
          <Modal.Title>Success!</Modal.Title>
      </Modal.Header>
        <Modal.Body>
          Your video has been sent to your recipient!
        </Modal.Body>
    </Modal>
    }
<Fade Cascade>
<Row>
    <Col xs={12} md={isCollapsed? 0:2} className={isCollapsed ? 'sidebar-collapsed' : 'sidebar'}>
      <Fade>
          <Sidebar/>
      </Fade>
    </Col>
  <Col xs={12} md={isCollapsed? 12:10}>
  <Container fluid>

<Button className="m-2 float-end" variant="outline-dark" onClick={handleShow}>
  <img src={info}></img>
</Button>

<Offcanvas show={show} onHide={handleClose} backdrop="static" placement="end">
<Offcanvas.Header closeButton>
      <Offcanvas.Title>How Uploading Videos Works</Offcanvas.Title>
</Offcanvas.Header>
<Offcanvas.Body>
  <p>
    To send a video you have 2 options.
    Option 1 is to upload a video, or 
    Option 2, to record a video on the 
    webapp.
  </p> 
  <p>  
    Option 1 requires you to do the following:
    <ul>
      <li>
        1. upload a video file, where 
        a preview will show up. If 
        satisfied, enter the email
        of the user you wish to send
        to then click send video to 
        send the file.  
      </li>
      <li>
        2. If not happy with the video, 
        simply click upload video to 
        retry with another file, following 
        step 1 above.
      </li>
    </ul>    
  </p>
  <p>
    Option 2 requires you to do the following:
    <ul>
      <li>
        1. record a video using your camera. 
        Simply click start record on the 
        top and click stop record when done.  
      </li>
      <li>
        2. To preview the video, click 
        preview video. If satisfied, 
        enter the recipient's email, 
        and click send video. If not, 
        click retake video, and 
        repeat step 1 and 2. 
      </li>
    </ul> 
  </p>
</Offcanvas.Body>
</Offcanvas>

</Container>
<Container fluid>
  <Row className='mt-4'>
               
      <Col className='upload-record-section' >
      <div className="p-2 text-center" >
        <ToggleButtonGroup className="pb-2" type="radio" name="options" defaultValue={1}>
          <ToggleButton id="tbg1" value={1} onClick={()=>{handleType(1)}}>
            Upload Video
          </ToggleButton>
          <ToggleButton id="tbg2" value={2} onClick={()=>{handleType(2)}}>
            Record Video
          </ToggleButton>
        </ToggleButtonGroup>
        <>
        {type===1? 
        (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFileLg" className="d-grid gap-2">
            <Form.Label className="display-4">Upload Video</Form.Label>
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
          <Row>
            <Col className='upload-area'>
              <Form.Group controlId="formFileLg" className="d-grid gap-2">
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
                    <Fade>
                      {load? (
                      <>
                        <Alert className="bg-primary text-white"> 
                          Your video is in the process of blurring. 
                          Please wait a until it is finished.
                        </Alert>
                        <Spinner variant="primary" animation="grow" />
                      </>
                      ):(
                      <video  width="400" height="225" controls>
                        <source src={file} type="video/mp4"/>
                      </video>
                      )}
                    </Fade> 
                  )}
                </div>
              </Form.Group>
            </Col>
            <Col className="pt-3">
              <Container fluid>
                  <Form.Group controlId="formVideoName" className="mb-3">
                    <Form.Label>Video Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter video name" 
                      value={videoName} 
                      onChange={(e) => setVideoName(e.target.value)} // Update the videoName state when the input changes
                    />
                  </Form.Group>
                  <Form.Group controlId="formRecipientEmail" className="mb-3">
                      <Form.Label>Recipient Email</Form.Label>
                      <Form.Control 
                        type="email" 
                        required 
                        placeholder="Enter recipient's email" 
                        value={recipientEmail} 
                        onChange={(e) => setRecipientEmail(e.target.value)} 
                      />
                  </Form.Group>
                  <Form.Group controlId="formRetentionPeriod" className="mb-3">
                    <Form.Label className="text-black">Retention Period in days (1-365)</Form.Label>
                    <Form.Control 
                      type="number" 
                      required 
                      min="1" max="365" 
                      placeholder="Enter retention period in days" 
                      value={retentionPeriod} 
                      onChange={(e) => setRetentionPeriod(e.target.value)} 
                    />
                  </Form.Group>
                  <Form.Group controlId="formTags" className="mb-3">
                    <Form.Label>Tags</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Type a tag and press Enter"
                      value={tagsInput} // Controlled component
                      onChange={(e) => setTagsInput(e.target.value)} // Use onChange instead
                      onKeyDown={handleKeyDown}
                    />
                  </Form.Group>
              {/* Display the tags */}
              <div className="tags-container">
                  {tags.map((tag, index) => (
                    <div key={index} className="tag-badge">
                      {tag}
                      <button type="button" onClick={() => removeTag(index)}>×</button>
                    </div>
                ))}
              </div>
              </Container>
            </Col>
          </Row>

          <Button onClick={()=>{handleBlur()}} disabled={file? false : true}>Blur video</Button> {' '}
          <Button  variant="info" type="submit">Send video</Button>
        </Form>
        ):
        (
        <>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <div className="mb-2"> 
              {capturing? 
                ( <>
                    <Button variant="danger" onClick={handleStopRecord}>
                      <Record width="16" height="22"/> {' '}
                      Stop Recording
                    </Button>
                  </>
                ):(
                  <> 
                    <Button onClick={handleStartRecord} disabled={disableRecord}>
                      <Record fill={"white"} width="16" height="22"/> {' '}
                      Start Recording
                    </Button>
                  </> 
                )
              }
              </div> 
              <>
              </>
              ):(
                <Fade>
                  {load? (
                  <>
                    <Alert className="bg-primary text-white"> 
                      Your video is in the process of blurring. 
                      Please wait a until it is finished.
                    </Alert>
                    <Spinner variant="primary" animation="grow" />
                  </>
                  ):(
                  <video width={isMobile? height : width} height={isMobile? width : height} controls>
                    <source src={file} type="video/mp4"/>
                  </video>
                  )}
                </Fade> 
              )}
            </div>
          </Form.Group>
          <Form.Group controlId="formRecipientEmail" className="mb-3 mt-3">
              <Form.Label>Recipient Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                placeholder="Enter recipient's email" 
                value={recipientEmail} 
                onChange={(e) => setRecipientEmail(e.target.value)} 
              />
          </Form.Group>
          <Form.Group controlId="formVideoName" className="mb-3">
            <Form.Label>Video Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter video name" 
              value={videoName} 
              onChange={(e) => setVideoName(e.target.value)} // Update the videoName state when the input changes
            />{/* */}
          </Form.Group>
          <Form.Group controlId="formTags" className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              placeholder="Type a tag and press Enter"
              value={tagsInput} // Controlled component
              onChange={(e) => setTagsInput(e.target.value)} // Use onChange instead
              onKeyDown={handleKeyDown}
            />
          </Form.Group>
          {/* Display the tags */}
          <div className="tags-container">
            {tags.map((tag, index) => (
              <div key={index} className="tag-badge">
                {tag}
                <button type="button" onClick={() => removeTag(index)}>×</button>
              </div>
            ))}
          </div>
          <Form.Group controlId="formRetentionPeriod" className="mb-3">
            <Form.Label className="text-black">Retention Period in days (1-365)</Form.Label>
            <Form.Control 
              type="number" 
              required 
              min="1" max="365" 
              placeholder="Enter retention period in days" 
              value={retentionPeriod} 
              onChange={(e) => setRetentionPeriod(e.target.value)} 
            />
          </Form.Group>
          <Button onClick={()=>{handleBlur()}} disabled={file? false : true}>Blur video</Button> {' '}
          <Button  variant="info" type="submit">Send video</Button>
        </Form>
        ):
        (
        <>
        <Form onSubmit={handleSubmit}>
          <div className="mb-2"> 
          {capturing? 
            ( <>
                <Button variant="danger" onClick={handleStopRecord}>
                  <Record width="16" height="22"/> {' '}
                  Stop Recording
                </Button>
              </>
            ):(
              <> 
                <Button onClick={handleStartRecord} disabled={disableRecord}>
                  <Record fill={"white"} width="16" height="22"/> {' '}
                  Start Recording
                </Button>
              </> 
            )
          }
          </div> 
          <>
          {file === null? 
          (<Fade>
            <Webcam  width={isMobile? height : width} height={isMobile? width : height} audio={true} ref={webcamRef}/>
           </Fade>
            ):(
            <Fade>
              {load? (
              <>
                <Alert className="bg-primary text-white"> 
                  Your video is in the process of blurring. 
                  Please wait a until it is finished.
                </Alert>
                <Spinner variant="primary" animation="grow" />
              </>
              ):(
              <video  width={isMobile? height : width} height={isMobile? width : height} controls>
                <source src={file} type="video/mp4"/>
              </video>
              )}
            </Fade>  
          )}
          </>
          <Form.Group controlId="formRecipientEmail" className="mb-3 mt-3">
              <Form.Label>Recipient Email</Form.Label>
              <Form.Control 
                type="email" 
                required 
                placeholder="Enter recipient's email" 
                value={recipientEmail} 
                onChange={(e) => setRecipientEmail(e.target.value)} 
              />
          </Form.Group>
          <Form.Group controlId="formVideoName" className="mb-3">
            <Form.Label>Video Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter video name" 
              value={videoName} 
              onChange={(e) => setVideoName(e.target.value)} // Update the videoName state when the input changes
            />
          </Form.Group>
          <Form.Group controlId="formTags" className="mb-3">
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              placeholder="Type a tag and press Enter"
              value={tagsInput} // Controlled component
              onChange={(e) => setTagsInput(e.target.value)} // Use onChange instead
              onKeyDown={handleKeyDown}
            />
          </Form.Group>
          {/* Display the tags */}
          <div className="tags-container">
            {tags.map((tag, index) => (
              <div key={index} className="tag-badge">
                {tag}
                <button type="button" onClick={() => removeTag(index)}>×</button>
              </div>
            ))}
          </div>
          <Form.Group controlId="formRetentionPeriod" className="mb-3">
            <Form.Label className="text-black">Retention Period in days (1-365)</Form.Label>
            <Form.Control 
              type="number" 
              required 
              min="1" max="365" 
              placeholder="Enter retention period in days" 
              value={retentionPeriod} 
              onChange={(e) => setRetentionPeriod(e.target.value)} 
            />
          </Form.Group>
          <div className="mt-2">
            <Button onClick={()=>{handleRetake()}} disabled={disable}>Retake video</Button> {' '}
            <Button onClick={()=>{handleBlur()}} disabled={disable}>Blur video</Button> {' '}
          </div>
          <div className="d-grid p-4 ">
            <Button type="submit"  variant="info" disabled={disable}>Send video</Button>
          </div>
        </Form>   
        </>
        )
        }
        </>
      </div>
      </Col>
      </Row>
    </Container>
    </Col>
  </Row>
  </Fade>
  </>
  )
}

export default UploadVideoPage;
