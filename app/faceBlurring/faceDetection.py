import boto3
import cv2
import time 
from moviepy.editor import VideoFileClip
import os
import concurrent.futures
boto3.setup_default_session(profile_name='team4-dev')



def detect_faces(VideoFrame):
    #start = time.time()
    rek_client = boto3.client('rekognition')
    #Load frame - Calls a tuple - ignore first varible using '_', only care about the second
    _, img_bytes = cv2.imencode(".jpg", VideoFrame)
    img_bytes = img_bytes.tobytes()
    
    # Call rekognition api for each frame 
    response = rek_client.detect_faces(Image={'Bytes': img_bytes}) 
    face_details = []
    for faces in response['FaceDetails']:
        face_details.append(faces['BoundingBox'])
    
    #end = time.time()
    #print(f"AWS CALL TIME: {end - start}\n")
    return face_details

def blur_faces_opencv(frame, face_details):
    #Copy frame into new variable
    #start = time.time()
    image = frame.copy()
    h, w, _ = image.shape

    for face_detail in face_details:
        x = int(face_detail['Left'] * w)
        y = int(face_detail['Top'] * h)
        width = int((face_detail['Width'] * w)*1.2)
        height = int(face_detail['Height'] * h)

            # Extract the face region            
        face_region = image[y:y+height, x:x+width]
        if not face_region.size == 0:
            # Apply blur to the face region
            blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
        # Replace the original face region with the blurred version
            image[y:y+height, x:x+width] = blurred_face
    #end = time.time()
    #print(f"BLUR CALL TIME: {end-start} seconds\n")
    return image

def integrate_audio(original_video, output_video, audio_path=os.path.dirname(__file__)+'/temp/audio.mp4'):
    # Extract audio
    my_clip = VideoFileClip(original_video)
    my_clip.audio.write_audiofile(audio_path,codec='libmp3lame')

    temp_location = os.path.dirname(__file__)+'/temp/output_video.mp4'
    # Join output video with extracted audio
    videoclip = VideoFileClip(output_video)
    #videoclip = videoclip.set_audio(VideoFileClip(audio_path))
    videoclip.write_videofile(temp_location, codec='libx264', audio=audio_path, audio_codec='libmp4lame')

    os.rename(temp_location, os.path.dirname(__file__)+'/temp/blurredVideo.mp4')
    # Delete audio
    os.remove(audio_path)

def parallel_detect_faces(video_path, frame_skip,video_out_path):
    cap = cv2.VideoCapture(video_path)
    input_fps = cap.get(cv2.CAP_PROP_FPS)

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

def process_video():
    
    start = time.time() #//for timing the entire video 
    # Temp variable for testing - load local files for it
    video_path = "C:/Users/Gauth/COSC499/year-long-project-team-4/tests/AudioTestUpdated.mp4"
    video_out_path = "C:/Users/Gauth/COSC499/year-long-project-team-4/tests/TestAudioBlur.mp4" 
    frame_skip = 3
    
    # This code below is for flask I believe? maybe not need confirmation
        # if 'file' not in request.files:
        #     return 'No file found'
        # file = request.files['file']
        # if file.filename == '':
        #     return "no file selected"
        # uploaded_path = 'temp/uploaded_video.mp4'
        # file.save(uploaded_path)
        # processed_path = 'temp/processed_video.mp4'
        # parallel_detect_faces(uploaded_path,frame_skip, processed_path)
        # integrate_audio(uploaded_path,processed_path)
        # return send_file("../temp/blurredVideo.mp4", as_attachment=True)
    
    # number of frames between frame samples 
   

    
    # Start handling video - Load, and save the output
    parallel_detect_faces(video_path,frame_skip,video_out_path)
    integrate_audio(video_path, video_out_path)
    #end = time.time()
    #print(f"TOTAL TIME FOR PROCESSING: {end - start} seconds \n") #//printing the speed 
    
if __name__ == "__main__":
    process_video()