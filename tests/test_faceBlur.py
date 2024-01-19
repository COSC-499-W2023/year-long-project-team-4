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
    os.remove('../app/faceBlurring/temp/blurredVideo.mp4')
    faceBlurring.process_video()  # If this function works, you should expect to see a file in your /app/faceDection/temp/ named blurredVideo.mp4


