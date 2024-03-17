# Team 4: Project Option 3 -  Video Streaming Using Cloud Technology

**Team Members:**
* Bethchesman - Beth Chesman
* colevs - Cole Van Steinburg
* DenisGauthier - Denis Gauthier
* lakshaykarnwal - Lakshay Karnwal
* rahulng7963 - Rahul Nagulapally

## Project Information:
* Project goal: To create a web application using AWS services for professionals receiving video submissions from users while protecting their privacy.

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
- NodeJS installed
- Nginx reverse proxy installed to serve your application. (not needed if running locally or preferred way of hosting)
- Gunicorn installed to run your Flask application. (Similar to nginx)

### Installation 
To start, clone our repo:
``` git clone https://github.com/COSC-499-W2023/year-long-project-team-4.git ```
Then install the Python dependencies listed in the `requirements.txt` file.
        ```
        cd year-long-project-team4
        pip install -r requirements.txt ```
        
Then create a .env file in ```year-long-project-team4/app```directory following this example structure: 
```
SSH = "True"/"False" - This flags if you need to SSH into your database or not. 
SSHUSER=User name that your .pem was given - Default appears to be Ubuntu
KEYPATH=Path to your .pem file for ssh'ing into your ec2
ADDRESS=Endpoint of your AWS RDS 
PORT=For your RDS - the default is 3306
EC2_ADDRESS=IP address of your ec2 (Public ipv4) 

DBUSER=DATABASE USER NAME
PASS= Password for the user
HOST=IP of the database (127.0.0.1)
MYDB=Database name 

BUCKETNAME= S3 bucket name 

TEST=True/False - Uses test database & test options (This assumes you have a development and production database. For simplicity of getting this just running, set Test to False.  
LOCAL= True/False - Use this to mimic S3 locally 

# These below are to be grabbed from the AWS Console. 
ACCESSKEY=''
SECRETKEY=''
SESSTOKEN=''
```
* If you want to run locally, set the Local flag to True and all of this can be set up to run without AWS access. However, you will lose some functionality namely email & face blurring, and will require you to still have a database connection. 


1. **Start the Backend Server:**
   - Navigate to the `year-long-project-team4/app` directory.
   - Run `py main.py` or `python3 main.py` depending on your Python environment.
   - Note: The `requirements.txt` file might become outdated over time, requiring updates to fix any dependency issues.

2. **Download Frontend Dependencies:**
   - Open a second console.
   - Navigate to `year-long-project-team4/app/client`.
   - Run `npm install` to download any required dependencies.

3. **Start the Frontend:**
   - Once dependencies are installed, start the frontend with `npm run start`.
   - The frontend will be running on `localhost:3000` by default.

You now have a working local platform if all steps were completed correctly!


## Usage

Our platform is designed for professionals to have videos safely and securely sent to them, with the ability to discuss further on the platform. Here's how you can use our platform:

1. **Upload Videos**:
   - Users can easily upload or record their videos to the platform.
   - Ensure the security of your videos by encrypting all data during transmission and storage.

2. **Receive Feedback**:
   - Once uploaded, professionals can provide feedback or engage in discussions with the client. 
   - Utilize the chat feature for convenient communication among users.

3. **Privacy Protection**: 
   - Prioritize privacy by blurring faces during the video-sending phase.
   - Everything sent or received is automatically encrypted to ensure confidentiality. 

4. **Security Measures**:
   - Security is our top priority. We implement industry-standard encryption techniques to ensure that your data remains safe and protected at all times.
   - Verification of emails on account creation. 

Whether you are a professional looking for a simple and secure way to receive sensitive videos or a client looking to share videos with a professional, SafeMov is the right choice. 

## Contribution

Contributions to SafeMov are always welcomed and appreciated! As an open-source project, we encourage developers to contribute in various ways:

- **Fork and Develop**: Feel free to fork the repository and develop features or enhancements on your own. Once you're ready, submit a pull request, and we'll review it promptly.

- **Clone and Modify**: If you have specific customization needs or improvements in mind, you can clone the repository and modify it to suit your requirements.

- **Bug Reporting**: If you encounter any bugs or issues while using SafeMov, please report them on our GitHub repository. Before submitting a new issue, we recommend researching to ensure it's not already reported or being addressed. Clear and detailed bug reports help us improve the platform.

- **Feature Requests**: Do you have a feature in mind that would enhance SafeMov? Feel free to submit a feature request through GitHub issues. We value your feedback and consider all feature requests for future development.

- **Pull Requests**: We accept pull requests for features, improvements, and bug fixes. When submitting a pull request, please ensure that your code adheres to our coding standards and includes appropriate documentation.

## License

SafeMov is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html). 

This means that you are free to use, modify, and distribute the software as per the terms outlined in the license. You are welcome to study, share, and contribute to the project.

For more details about the permissions and restrictions imposed by the GNU GPL v3.0, please refer to the [full text of the license](https://www.gnu.org/licenses/gpl-3.0.html).

Please note partially parts of the project contain code derived or copied from the following project:
- [Rekognition-video-people-blurring-cdk (MIT-0 License)](https://github.com/aws-samples/rekognition-video-people-blurring-cdk)

