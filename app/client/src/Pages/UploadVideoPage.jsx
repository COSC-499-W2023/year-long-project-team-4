import React, {useState} from 'react'
import {Form,Button} from 'react-bootstrap'
import {useNavigate} from 'react-router-dom'
import {
  viewVideoPath,
} from "../Path"

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
 // const player = videojs('videoPreview', {});
  const handleSubmit =(e)=>{
    e.preventDefault();
    navigate(viewVideoPath);
   };
   const handleChange = (event) => {
    try {
    setFile(URL.createObjectURL(event.target.files[0]));
    } catch(error) {
      setFile(null);
    }
  };
   console.log(file);
  return (
    <div class="position-absolute top-50 start-50 translate-middle text-center">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFileLg" className="d-grid gap-2">
          <Form.Label class="display-4 " >Upload Video</Form.Label>
          <Form.Control 
          type="file" 
          required 
          class="p-2 bg-light border" 
          accept="video/*" 
          size="lg" 
          onChange={handleChange}
          />
          <div>
            {file===null? (
            <>
            </>
            ):
            (
              <video 
                src={file}
                width="500" 
                height="400" 
                controls
                >
               </video>   
            )}
          </div>
        </Form.Group>
        <Button type="submit">Upload file</Button>
      </Form>
    </div>
  )
}

export default UploadVideoPage