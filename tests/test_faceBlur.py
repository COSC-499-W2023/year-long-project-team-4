import pytest
import os
import sys
import cv2

sys.path.append(os.path.abspath('../app'))
import faceBlurring
import flaskapp

@pytest.fixture
def sample_video_path():
    return os.path.dirname(__file__)+"/AudioTest.mp4"

@pytest.fixture
def sample_output_path():
    return os.path.dirname(__file__)+"/TestBlurred.mp4"

@pytest.fixture
def app():
    app = flaskapp.create_app()
    app.config['TESTING'] = True
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_detect_faces():
    image = os.path.join(os.path.dirname(__file__), "TestBlurFace.jpeg")
    frame = cv2.imread(image)
    result = faceBlurring.detect_faces(frame)
    assert isinstance(result, list)

def test_blur_faces_opencv():
    image = os.path.join(os.path.dirname(__file__), "TestBlurFace.jpeg")
    frame = cv2.imread(image)
    face_details = faceBlurring.detect_faces(frame)
    result = faceBlurring.blur_faces_opencv(frame, face_details)
    assert isinstance(result, type(frame)) 

def test_parallel_detect_faces(sample_video_path, sample_output_path):
    frame_skip = 3
    faceBlurring.parallel_detect_faces(sample_video_path, frame_skip, sample_output_path)

    # Assert that the output file exists
    assert os.path.exists(sample_output_path)

def test_process_video():
    # This runs off the assumption blurredVideo is in the temp folder
    video_path = '../app/faceBlurring/temp/blurred_AudioTest.mp4'
    if os.path.exists(video_path):
        os.remove(video_path)
        print(f"File {video_path} removed successfully.")
    else:
        print(f"File {video_path} does not exist.")
    file_path = os.path.join(os.path.dirname(__file__), 'AudioTest.mp4')
    faceBlurring.process_video(file_path)  # If this function works, you should expect to see a file in your /app/faceDection/temp/ named blurred_{videoName}.mp4
    assert os.path.exists(video_path)
    
def test_file_removal(client):
    if os.path.exists('../app/faceBlurring/temp/blurred_AudioTest.mp4'):
        os.remove('../app/faceBlurring/temp/blurred_AudioTest.mp4')
    
    file_path = 'AudioTest.mp4'
    data = {
        'file' : (open(file_path,'rb'), file_path)
    }
    response = client.post('bucket/blurRequest', data=data)

    assert response.status_code == 200
    assert not os.path.exists('../app/faceBlurring/temp/blurred_AudioTest.mp4')
    
