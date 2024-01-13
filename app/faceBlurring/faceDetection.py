import boto3
import cv2


boto3.setup_default_session(profile_name='team4-dev')
rek_client = boto3.client('rekognition')


def detect_faces(VideoFrame):
    _, img_bytes = cv2.imencode(".jpeg", VideoFrame)
    img_bytes = img_bytes.tobytes()
    
    response = rek_client.detect_faces(Image={'Bytes': img_bytes})
    print(response)
    face_details = []
    for faces in response['FaceDetails']:
        face_details.append(faces['BoundingBox'])
    print(face_details)
    return face_details


def blur_faces_opencv(frame, face_details):
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

    return image

if __name__ == '__main__':
    video_path = "../../tests/test_video.mp4"
    video_out_path = "../../tests/testBlur_video.jpeg"
    
    cap = cv2.VideoCapture(video_path)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(video_out_path, fourcc, 30,(int(cap.get(3)), int(cap.get(4))))
    image_bytes = cv2.imread('C:/Users/Gauth/COSC499/year-long-project-team-4/tests/TestBlurFace.jpeg')
    face_details = detect_faces(image_bytes)
    out_image = blur_faces_opencv(image_bytes,face_details)
    cv2.imwrite(video_out_path, out_image)
    
    cv2.imshow("Blurred Face", out_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    # while cap.isOpened():
    #     ret, frame = cap.read()
    #     if not ret:
    #         break
        
    #     face_details = detect_faces(frame)
    #     print(face_details)
    