import pytest
import os
import sys
import cv2
sys.path.append(os.path.abspath('../app'))

import faceBlurring



@pytest.fixture
def sample_video_path():
    return os.path.dirname(__file__)+"/AudioTest.mp4"

@pytest.fixture
def sample_output_path():
    return os.path.dirname(__file__)+"/TestBlurred.mp4"

# @pytest.fixture
# def sample_frame():
#     image = os.path.dirname(__file__)+"/TestBlurFace.jpg"
#     frame = cv2.imread(image)
#     return frame

def test_detect_faces():
    image = os.path.dirname(__file__)+"/TestBlurFace.jpg"
    frame = cv2.imread(image)
    result = faceBlurring.detect_faces(frame)
    assert isinstance(result, list)

def test_blur_faces_opencv():
    image = os.path.dirname(__file__)+"/TestBlurFace.jpg"
    frame = cv2.imread(image)
    face_details = faceBlurring.detect_faces(frame)
    result = faceBlurring.blur_faces_opencv(frame, face_details)
    assert isinstance(result, list) 

def test_integrate_audio():
    # You may need to provide sample paths for testing
    original_video = "C:/Users/Gauth/COSC499/year-long-project-team-4/tests/AudioTest.mp4"
    output_video = "C:/Users/Gauth/COSC499/year-long-project-team-4/app/faceBlurring/temp/TestAudioBlur.mp4"
    audio_path = "C:/Users/Gauth/COSC499/year-long-project-team-4/app/faceBlurring/temp/audio.mp4"

    faceBlurring.integrate_audio(original_video, output_video, audio_path)
    
    # Assert that the output file exists
    assert os.path.exists(output_video)

def test_parallel_detect_faces(sample_video_path, sample_output_path):
    frame_skip = 3
    faceBlurring.parallel_detect_faces(sample_video_path, frame_skip, sample_output_path)

    # Assert that the output file exists
    assert os.path.exists(sample_output_path)

def test_process_video():
   faceBlurring.process_video()  # This function is expected to run without errors


