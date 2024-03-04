# Team 4: Project Option 3 -  Video Streaming Using Cloud Technology

**Team Members:**
* Bethchesman - Beth Chesman
* colevs - Cole Van Steinburg
* DenisGauthier - Denis Gauthier
* lakshaykarnwal - Lakshay Karnwal
* rahulng7963 - Rahul Nagulapally

## Project Information:
* Project goal: To create a web application using AWS services for professionals who will receive video submissions from users while protecting their privacy.

**Target users:**
* Senders: An average adult who has created a video of themself, has access to the Internet and phone/computer, and may want to have their face blurred throughout the video for privacy reasons.
* Receivers: Professionals (e.g., doctors, teachers, recruiters/interviewers) who need to review the video submissions for diagnosis or assessment reasons, and have access to the Internet and computer.

**Client Information**
* [UBC-CIC](https://cic.ubc.ca/)


## Getting Started

### Prerequisites
Before you begin, ensure you have met the following requirements:
- Access to an AWS S3 bucket to store your images.
- Ability to call AWS Rekognition APIs.
- Nginx reverse proxy installed to serve your application.
- Gunicorn installed to run your Flask application.

### Installation 
To start, clone our repo:
``` git clone https://github.com/COSC-499-W2023/year-long-project-team-4.git ```
Then install the Python dependencies listed in the `requirements.txt` file.
        ``` pip install -r requirements.txt ```
Then create a .env file in year-long-project-team4/app following this structure: 
```
SSH = "True"
SSHUSER=ubuntu
KEYPATH=Path to your .pem file for ssh'ing into ec2
ADDRESS=Endpoint of your AWS RDS 
PORT=3306
EC2_ADDRESS=IP address of your ec2 (Public ipv4) 

DBUSER=DATABASE USER NAME
PASS= Password for the user
HOST=IP of the database (127.0.0.1)
MYDB=Database name 

BUCKETNAME= S3 bucket name 

TEST=True - Uses test database & test options 
LOCAL= True/False - Use this to mimic S3 locally 

# These below are to be grabbed for the AWS Console. 
ACCESSKEY=''
SECRETKEY=''
SESSTOKEN=''
```

