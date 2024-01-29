import pymysql
import boto3
from sshtunnel import SSHTunnelForwarder
import os
from dotenv import load_dotenv, dotenv_values
import sys 
from datetime import datetime, timezone

sys.path.append(os.path.abspath('../app'))
load_dotenv()
SSH = os.getenv("SSH") == 'True'
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
TEST = os.getenv('TEST')

# s3_client = boto3.client(
# 's3',
# aws_access_key_id=ACCESS_KEY,
# aws_secret_access_key=SECRET_KEY,
# aws_session_token=SESSION_TOKEN)
s3_client = boto3.client('s3')

if(TEST.lower() == "true"):
    DBNAME = "Team4dbTest"

def get_passed_retDates() -> list:
    """
    Get a list of the videos needed to be deleted.

    Returns:
        - list: The videoNames with a retDate that has passed.
        - int: -1 if an error occured during retrieval.
        
    """
def get_passed_retDates() -> list:
    """
    Get a list of the videos needed to be deleted.

    Returns:
        - list: The videoNames with a retDate that has passed.
        - int: -1 if an error occurred during retrieval.
    """
    db = None
    result = []

    try:
        if SSH:
            # Creates the SSH tunnel to connect to the DB
            with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=SSHUSER, ssh_pkey=KPATH, remote_bind_address=(ADDRESS, PORT)) as tunnel:
                print("SSH Tunnel Established")
                # Db connection string using SSH tunnel
                db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=DBNAME)
                cur = db.cursor()
                now = datetime.now(timezone.utc)
                query = f"SELECT videoName FROM videos WHERE retDate <= %s"
                cur.execute(query, (now,))
                result = cur.fetchall()
                cur.close()
        else:
            # Db connection string without SSH tunnel
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=PORT, database=DBNAME)
            cur = db.cursor()
            now = datetime.now(timezone.utc)
            query = f"SELECT videoName FROM videos WHERE retDate <= %s"
            cur.execute(query, (now,))
            result = cur.fetchall()
            cur.close()
    except Exception as e:
        print(e)
        result = -1
    finally:
        if db:
            db.close()
        return result
       
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

def retention_delete(condition: str, condition_values: tuple, obj_path: str) -> int:
    """
    Delete records that have a passed retention date.
    
    Args:
        condition (str): The WHERE clause condition for deletion.
        condition_values (tuple): Values to replace placeholders in the condition.
        obj_path (str): The object key (path) of the file to delete.

    Returns:
        int: An integer result code indicating the outcome of the deletion operation.
             - 1: Deletion was successful.
             - -1: An error occurred during deletion.
    """
    
    db = None
    result = 0

    try:
        if SSH:
            # Creates the SSH tunnel to connect to the DB
            with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=SSHUSER, ssh_pkey=KPATH, remote_bind_address=(ADDRESS, PORT)) as tunnel:
                print("SSH Tunnel Established")
                # Db connection string using SSH tunnel
                db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=DBNAME)
                cur = db.cursor()
                query1 = "START TRANSACTION"
                cur.execute(query1)
                query2 = f"DELETE FROM videos WHERE {condition}"
                cur.execute(query2, condition_values)
                proceed = already_existing_file('team4-s3', obj_path)
                
                if proceed:
                    # Delete the object from S3
                    s3_client.delete_object(Bucket='team4-s3', Key=obj_path)
                    db.commit()
                    cur.close()
                    result = 1
                else:
                    db.rollback()
                    result = -1
        else:
            # Db connection string without SSH tunnel
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=PORT, database=DBNAME)
            cur = db.cursor()
            query1 = "START TRANSACTION"
            cur.execute(query1)
            query2 = f"DELETE FROM videos WHERE {condition}"
            cur.execute(query2, condition_values)
            proceed = already_existing_file('team4-s3', obj_path)
            
            if proceed:
                # Delete the object from S3
                s3_client.delete_object(Bucket='team4-s3', Key=obj_path)
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
     
def retention() -> int:
    """
    Gets list of videos with passed retention dates and deletes them from the S3 bucket and database.

    Returns:
       bool: True if the deletion is successful, False otherwise.
    """
    try:
        deleted_files = 0
        data = get_passed_retDates()
        for items in data:
            retention_delete("videoName = %s", (items,), items)
            # Get how many files have been deleted
            if (not already_existing_file('team4-s3',items)):
                deleted_files += 1
        return deleted_files
    except Exception as e:
        print(e)
        return -1
        
        
if __name__ == "__main__":
    retention()
