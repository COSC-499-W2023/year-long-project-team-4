import os
import boto3
import pymysql
from sshtunnel import SSHTunnelForwarder
from dotenv import load_dotenv
import sys 

sys.path.append(os.path.abspath('../app'))
load_dotenv()
SSHUSER = os.getenv("SSHUSER")
KPATH = os.getenv("KEYPATH")
ADDRESS = os.getenv("ADDRESS")
PORT = int(os.getenv("PORT"))
DBUSER = os.getenv("DBUSER")
DBPASS = os.getenv("PASS")
HOST = os.getenv("HOST")
DBNAME = os.getenv("MYDB")

ACCESS_KEY = os.getenv("ACCESSKEY")
SECRET_KEY = os.getenv('SECRETKEY')
SESSION_TOKEN = os.getenv('SESSTOKEN')

boto3.setup_default_session(profile_name = 'team4-dev')
ses_client = boto3.client(
    'ses', 
    region_name='ca-central-1', 
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    aws_session_token=SESSION_TOKEN)

def lambda_handler(event, context):
    """
    Lambda handler that Rruns when a video is entered into the s3 bucket.
    It calls the other two functions in this file.
    """
    # Get information about the uploaded file
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Get videoName from key
    videoName = os.path.basename(key)

    # Get user email from the database
    user_email = get_email(videoName)

    if user_email:
        # Send email to the user
        send_email(user_email)

def get_email(videoName):
    """
    Gets email from database by using the video's name that was uploaded

    Args:
        videoName str: video's name

    Returns:
        str: The reciever's email address
        int: -1 if function fails
    """
    try:
        with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), 
                ssh_username=SSHUSER,
                ssh_pkey=KPATH, 
                remote_bind_address=(ADDRESS,PORT)
        )as tunnel:
            print("SSH Tunnel Established")
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=DBNAME)
            if db:
                cur = db.cursor()
                # Retrieve userID based on the videName
                cur.execute("SELECT recieverID FROM videos WHERE videoName = %s", (videoName,))
                recieverID = cur.fetchone()
                recieverID = recieverID[0] 
                # Retrieve email based on the user's ID
                cur.execute("SELECT email FROM userprofile WHERE id = %s", (recieverID,))
                result = cur.fetchone()
                result = result[0]     
                cur.close()      
    except Exception as e:
        print(e)
        result = -1
    finally:
        if db:
            db.close()
        return result

def send_email(user_email):
    """
    Sends an email to user who just recieved a video

    Args:
        user_email str: The email address of the reciever

    Returns:
        int: 1 if email sent
        int: -1 if function failed
    """
    
    sender_email = 'safemovnow@gmail.com'
    
    # Compose the email message
    subject = "You've Recieved a Video"
    html_body = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Video Received Notification</title>
        <style>
            <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #007bff;
        }
        
        p {
            margin-bottom: 20px;
        }
    </style>
        </style>
    </head>
    <body>
        <div class="container">
            <h1>A New Video!</h1>
            <p>We are pleased to inform you that you have a new video ready for viewing.</p>
            <p>Thank you for choosing SafeMov!</p>
            <p>Best regards,<br>SafeMov</p>
        </div>
    </body>
    </html>
    """

    try:
        # Send the email
        email = ses_client.send_email(
            Source=sender_email,
            Destination={'ToAddresses': [user_email]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Html': {'Data': html_body}}
            }
        )

        print(f"Email sent to {user_email}.")
        return 1
        
    except Exception as e:
        print(e)
        return -1
