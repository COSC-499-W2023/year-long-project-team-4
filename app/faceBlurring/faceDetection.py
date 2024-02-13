import boto3
import cv2
import time 
from moviepy.editor import VideoFileClip
import os
import concurrent.futures
from dotenv import load_dotenv

LOCAL = os.getenv('LOCAL') == 'True'
if not os.path.isdir('faceBlurring/temp'):
    os.mkdir('faceBlurring/temp')

if not LOCAL: # Flag for local or not
    # RUN "AWS CONFIGURE SSO" before running code - this one included if local is not set to True 
    boto3.setup_default_session(profile_name='team4-dev')
    s3_client = boto3.client('s3')


def detect_faces(VideoFrame):
    try:
        rek_client = boto3.client('rekognition')
        #Load frame - Calls a tuple - ignore first varible using '_', only care about the second
        _, img_bytes = cv2.imencode(".jpg", VideoFrame)
        img_bytes = img_bytes.tobytes()
        
        # Call rekognition api for each frame 
        response = rek_client.detect_faces(Image={'Bytes': img_bytes}) 
        face_details = []
        for faces in response['FaceDetails']:
            face_details.append(faces['BoundingBox'])
        
        return face_details
    except Exception as e:
        print(f'Failed to do the rekognition call: {e}')

def blur_faces_opencv(frame, face_details):
    #Copy frame into new variable
    try:
        image = frame.copy()
        h, w, _ = image.shape
        
        for face_detail in face_details:
            x = int(face_detail['Left'] * w)
            y = int(face_detail['Top'] * h)
            
            # Change these numbers below to change the blur box size
            width = int((face_detail['Width'] * w)*1.2)
            height = int(face_detail['Height'] * h)

                # Extract the face region            
            face_region = image[y:y+height, x:x+width]
            if not face_region.size == 0:
                # Apply blur to the face region
                blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
            # Replace the original face region with the blurred version
                image[y:y+height, x:x+width] = blurred_face

        return image
    except Exception as e:
        print(f"Failed to find frame and face information to blur: {e}")

# Code snippet from: https://github.com/aws-samples/rekognition-video-people-blurring-cdk/blob/bf7c1625ec2571c19889c141aef5615bcec30d6d/stack/lambdas/rekopoc-apply-faces-to-video-docker/video_processor.py#L91
def integrate_audio(original_video, output_video, audio_path=os.path.dirname(__file__)+'/temp/audio.mp4'):
    try:
    # Extract audio
        my_clip = VideoFileClip(original_video)
        my_clip.audio.write_audiofile(audio_path,codec='libmp3lame')
        temp_location = os.path.join(os.path.dirname(__file__), 'temp', 'output_video.mp4')
        
        # Join output video with extracted audio
        videoclip = VideoFileClip(output_video)
        videoclip.write_videofile(temp_location, codec='libx264', audio=audio_path, audio_codec='libmp4lame')
        videoLoc = os.path.basename(original_video)
        os.rename(temp_location, os.path.dirname(__file__)+'/temp/blurred_'+videoLoc)
        
        # Delete audio
        os.remove(audio_path)
        os.remove(output_video)
    except Exception as e:
        print(f'Could not integrate audio to blurred video: {e}, removing all files')
        os.remove(audio_path)
        os.remove(output_video)    

def parallel_detect_faces(video_path, frame_skip,video_out_path):
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f'Error: Failed to open video at {video_path}')
        
    input_fps = cap.get(cv2.CAP_PROP_FPS)
    print(f"Input FPS: {input_fps}\n\n\n\n\n\n")
    # Sample frames
    sampled_frames = []
    face_details_dict = {}
    # Run aws rekognition calls in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []

        frame_num = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("Error: Failed to read frame from video")
                break

            # Check for new frame to pull
            if frame_num % frame_skip == 0:
                sampled_frames.append(frame_num)
                future = executor.submit(detect_faces, frame)
                futures.append((frame_num, future))

            frame_num += 1

        # Collect face details
        for frame_num, future in futures:
            face_details_dict[frame_num] = future.result()

    # Now process the video again, using the collected face details
    cap.release()
    cap = cv2.VideoCapture(video_path)

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(video_out_path, fourcc, input_fps, (int(cap.get(3)), int(cap.get(4))))

    frame_num = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Use previous frame boundaries for frames in between sampled frames
        if frame_num in sampled_frames:
            face_details = face_details_dict.get(frame_num, [])
        processed_frame = blur_faces_opencv(frame, face_details)
        out.write(processed_frame)

        frame_num += 1

    cap.release()
    out.release()


def process_video(upload_path):
    start = time.time() # for timing the entire video 
    
    # Change this number to change number of frames skipped - Higher number faster processing, however, blur is more jumpy
    frame_skip = 3
    
    # Generate the video_out_path using the video name
    base = os.path.basename(upload_path)
    video_out_path = os.path.join(os.path.dirname(__file__), 'temp', 'processed_' + base)
    print(video_out_path)
    
    # Start handling video - Parallel call for face detection
    parallel_detect_faces(upload_path,frame_skip,video_out_path)
    # Intregrate original video audio to new blurred
    integrate_audio(upload_path, video_out_path)
    end = time.time()
    print(f"TOTAL TIME FOR PROCESSING: {end - start} seconds \n") # printing the speed 
    
    