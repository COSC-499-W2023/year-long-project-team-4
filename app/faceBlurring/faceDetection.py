import boto3
import cv2
import time 

boto3.setup_default_session(profile_name='team4-dev')
rek_client = boto3.client('rekognition')


def detect_faces(VideoFrame):
    #start = time.time()
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
        width = int(face_detail['Width'] * w)
        height = int(face_detail['Height'] * h)

        # Extract the face region
        face_region = image[y:y+height, x:x+width]

        # Apply blur to the face region
        blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)

        # Replace the original face region with the blurred version
        image[y:y+height, x:x+width] = blurred_face
    #end = time.time()
    #print(f"BLUR CALL TIME: {end-start} seconds\n")
    return image

if __name__ == '__main__':
    start = time.time()
    # Temp variable for testing - load local files for it
    video_path = "C:/Users/Gauth/COSC499/year-long-project-team-4/tests/testVideo.mp4"
    video_out_path = "C:/Users/Gauth/COSC499/year-long-project-team-4/tests/testBlur_video1.mp4"
    
    frame_skip = 15
    frame_num = 0
    sampled_frame = None
    sampled_face_details =[]
    # Start handling video - Load, and save the output
    cap = cv2.VideoCapture(video_path)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(video_out_path, fourcc, 30,(int(cap.get(3)), int(cap.get(4))))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Send call to Rekon
        if frame_num % frame_skip == 0:
            sampled_face_details = detect_faces(frame)
            sampled_frame = frame.copy()
        elif sampled_frame is not None:
            processed_frame = blur_faces_opencv(frame,sampled_face_details)
            out.write(processed_frame)
            cv2.imshow("Blurred Faces", processed_frame)

        frame_num += 1
        
        
        #face_details = detect_faces(frame)
        
        # Take boundries from Reko and give to OpenCv to blur 
        #output_frame = blur_faces_opencv(frame,face_details)
        #out.write(output_frame)
        
        # Currently to display the blurring is working 
        #cv2.imshow("Blurred Faces", processed_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        
    cap.release()
    out.release()
    cv2.destroyAllWindows()
    end = time.time()
    print(f"TOTAL TIME FOR PROCESSING: {end - start} seconds \n")