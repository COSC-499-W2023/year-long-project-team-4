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
        bool: True if the deletion is successful, False otherwise.
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
                query1 = f"START TRANSACTION"
                cur.execute(query1)
                query2 = f"SELECT id FROM userprofile WHERE email = {email}"
                cur.execute(query2, email)
                userID = cur.fetchall()
                query3 = f"DELETE from videos WHERE recieverID = {userID}"
                cur.execute(query3, userID)
                proceed = already_existing_file('team4-s3',obj_path)
                if(proceed):
                    s3_client.delete_object(Bucket='team4-s3',Key=obj_path)
                    db.commit()
                    cur.close()
                    result = 1
                else:
                    db.rollback()
                    result = -1
    except Exception as e:
        print(e)
        result = -1
    finally:
        if db:
            db.close()
        return result