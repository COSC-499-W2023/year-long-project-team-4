import React, {useState, useEffect} from 'react';
import {Card, Col, Button, Row, ListGroup, Tab, Form, Modal, Tabs, InputGroup} from 'react-bootstrap';
import { homePath, receiveAndSendPath } from '../Path';
import {Fade} from 'react-reveal';
import axios from 'axios';
import see from '../Assets/eye.svg';
import unSee from '../Assets/eye-slash.svg';
import PasswordCheckList from "react-password-checklist";

const AccountPage = () => {
const [type, setType] = useState(false)
const [currentUser, setCurrentUser] = useState(null);
const [key, setKey] = useState('videos');
const handleSubmit = (e) => {
    e.preventDefault();
    const firstname = e.target.elements[0].value;
    const lastname = e.target.elements[1].value;
    const email = e.target.elements[2].value;
  }
const handleDelete = () =>{

}
const firstName = "firstname123";
const lastName = "lastname123";
const email = currentUser;

const [password, setPassword] = useState('');
const [videos, setVideos] = useState([]);
const [selectedVideo, setSelectedVideo] = useState(null);
const [showVideoModal, setShowVideoModal] = useState(false);

useEffect(() => {
    // Replace with the correct URL of your backend
    axios.get('http://localhost:8080/bucket/getvideos', {
        withCredentials: true})
        .then(response => {
            setVideos(response.data);
            console.log(response.data)
        })
        .catch(error => {
            console.error('There was an error fetching the videos!', error);
        });
}, []);

const handleVideoClick = (videoName) => {
    const formData = new FormData();
    formData.append('video_name', videoName);

    axios.post('http://localhost:8080/bucket/retrieve', formData, {
        withCredentials: true,
        responseType: 'blob' // Sets the expected response type to 'blob' since a video file is binary data
    })
    .then(response => {
        const videoURL = URL.createObjectURL(response.data);
        setSelectedVideo(videoURL);
        setShowVideoModal(true);
    })
    .catch(error => {
        console.error('There was an error retrieving the video!', error);
    });
};

const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
};

useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
              const response = await axios.get('http://localhost:8080/auth/currentuser', {
                withCredentials: true
              });
        
              if (response.data.email) {
                setCurrentUser(response.data.email);
              if (response.data.email) {
                setCurrentUser(response.data.email);
              } else {
                console.error('No user currently logged in');
              }
            }
            } catch (error) {
              console.error('There was an error fetching the current user', error);
            }
          fetchCurrentUser();
}});

return (
   <div className="container p-4">
    <Fade>
      <Card>
        <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
        >
          <Tab eventKey="videos" title="Videos received">
            <Row>
              <div className="display-4 text-center"> Receive Videos </div>
              <Col className="p-3">
                  <div className="display-6"> Videos Viewable</div>
                  {videos.map((video, index) => (
                      <div key={index} onClick={() => handleVideoClick(video.videoName)}>
                      <Button className='text-center mb-2' style={{minWidth: '150px'}}>
                      <p>Video{index + 1}</p>
                      </Button>
                      </div>
                  ))}
              </Col>   
            </Row>      
            <Modal show={showVideoModal} onHide={handleCloseVideoModal}>
              <Modal.Header closeButton>
                  <Modal.Title>Video Playback</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  {selectedVideo && <video src={selectedVideo} width="100%" controls autoPlay />}
              </Modal.Body>
            </Modal>
          </Tab>
          <Tab eventKey="account" title="Account Info">
            <div className="display-6 text-center"> Account Info </div>
            <Col className="p-4 fs-5">
              <ListGroup variant="flush">
                <ListGroup.Item> Email: {email}</ListGroup.Item>
                <ListGroup.Item> Email: {email}</ListGroup.Item>
                <ListGroup.Item> First Name: {firstName}</ListGroup.Item>
                <ListGroup.Item> Last Name: {lastName}</ListGroup.Item>
              </ListGroup>
            </Col>
          </Tab>
          <Tab eventKey="update" title="Update profile">
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <div className="display-6 text-center mb-2"> Update Profile Info </div>
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">First Name</InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                      />
                    </InputGroup>
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">Last Name</InputGroup.Text>
                      <Form.Control
                        type="email"
                        required
                      />
                     </InputGroup> 
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">Email</InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                      />
                    </InputGroup>
                    <InputGroup className="p-2">
                      <InputGroup.Text id="inputGroup-sizing-sm">Password</InputGroup.Text>
                      <Form.Control
                        type={type ? "text" : "password"}
                        required
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={()=> setType(!type)}
                      >
                        {!type? <img src={see}/> :<img src={unSee}/>}
                      </Button>
                    </InputGroup>
                    <PasswordCheckList
                      className='p-2'
                      rules={["capital", "specialChar", "minLength","maxLength", "number"]}
                      minLength={8}
                      maxLength={25}
                      value={password}
                      messages={{
                        minLength: "Password requires at least 8 characters.",
                        maxLength: "Password requires at most 25 characters.",
                        number: "Password must contain at least 1 number.",
                        capital: "Password must contain at least 1 capital letter.",
                        specialChar: "Password must contain at least 1 special character",
                      }}
                    />    
                  <Button className="m-2" variant="primary" type="submit"> Update Account</Button>
              </Form.Group>  
            </Form>
          </Tab>
          <Tab eventKey="delete" title="Delete profile">
            <div className="text-center">
              <div className="display-6 p-1"> Are you sure you want to delete your account? </div>
              <p className="m-3 p-1"> You will no longer be able to access any of the videos you sent or received.</p>
              <Button className="m-3" href={homePath} onClick={()=>{handleDelete()}}> Delete Account</Button>
            </div>
          </Tab>
        </Tabs>
      </Card>
      <div className="text-center">
        <Button className="mt-2" href={receiveAndSendPath}> Return to Home </Button>
      </div>
    </Fade>   
   </div>
  )
}

export default AccountPage