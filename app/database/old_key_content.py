import pymysql
import boto3
from sshtunnel import SSHTunnelForwarder
import os
from dotenv import load_dotenv, dotenv_values
import sys 
from datetime import datetime, timezone

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
TEST = os.getenv('TEST') == 'True'

s3_client = boto3.client(
's3',
aws_access_key_id=ACCESS_KEY,
aws_secret_access_key=SECRET_KEY,
aws_session_token=SESSION_TOKEN)

if(TEST):
    DBNAME = "Team4dbTest"
    
# Fuction from bucketUtils.py ------------------------------------    
def already_existing_file(bucket_name, obj_path):
    """
    Checks if an object already exists in the specified S3 bucket.

    Args:
        bucket_name (str): The name of the S3 bucket.
        obj_path (str): The object key (path) to check.

    Returns:
        bool: True if the object exists, False otherwise.
    """
    try:
        s3_client.head_object(Bucket=bucket_name, Key=obj_path)
        print(f"Object {obj_path} already exists in {bucket_name}")
        return True
    except Exception as e:
        print(f"Object {obj_path} does not exist in {bucket_name}")
        return False
# -----------------------------------------------------------------

def deleting_old_key_content(email):
    """
    Function is called when a new key is generated. 
    It deletes content tied to the old key.
    
    Args:
        email (str): email of user who forgot password.

    Returns:
        int: representing number of files deleted, -1 if function failed.
    """
    db = None
    result = 0
    try:
        with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), 
                ssh_username=SSHUSER,
                ssh_pkey=KPATH, 
                remote_bind_address=(ADDRESS,PORT)
        )as tunnel:
            print("SSH Tunnel Established")
            #Db connection string
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=db_name)
            if db:
                cur = db.cursor()
                #Begin transaction that only commits to Database if files will successfully delete
                query1 = f"START TRANSACTION"
                cur.execute(query1)
                #Get id of user through their email
                query2 = f"SELECT id FROM userprofile WHERE email = {email}"
                cur.execute(query2, email)
                userID = cur.fetchone
                #Get list of video names that need to be deleted
                query3 = f"SELECT videoName from videos WHERE recieverID = {userID}"
                cur.execute(query3, userID)
                videoList = cur.fetchall()
                #Loop through list, deleting files individually
                for items in videoList:
                    proceed = already_existing_file('team4-s3',videoList[items])
                    #Only proceed to delete files if they exist in bucket
                    if(proceed):
                        #Delete from database
                        query4 = f"DELETE FROM videos WHERE videoName = {(videoList[items],)}"
                        cur.execute(query4, (videoList[items],))
                        #Delete from S3 Bucket
                        s3_client.delete_object(Bucket='team4-s3',Key=videoList[items])
                        #Count deleted files
                        deleted_files += 1
                        #Commit transaction if files will delete
                        db.commit()
                        cur.close()
                        result = deleted_files
                    else:
                        #Cancel transaction if file doesn't exist
                        db.rollback()
                        result = -1
    except Exception as e:
        print(e)
        result = -1
    finally:
        if db:
            db.close()
        return result