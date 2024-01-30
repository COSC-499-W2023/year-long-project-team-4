import boto3
import sys,os
from dotenv import load_dotenv
from io import BytesIO
from sshtunnel import SSHTunnelForwarder
import pymysql
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
SSH_TUNNEL_ADDRESS = os.getenv("EC2_ADDRESS")

ACCESS_KEY = os.getenv("ACCESSKEY")
SECRET_KEY = os.getenv('SECRETKEY')
SESSION_TOKEN = os.getenv('SESSTOKEN')
TEST = os.getenv("TEST") == 'True'
LOCAL = os.getenv('LOCAL') == 'True'
BUCKETNAME = os.getenv("BUCKETNAME")

# s3_client = boto3.client(
# 's3',
# aws_access_key_id=ACCESS_KEY,
# aws_secret_access_key=SECRET_KEY,
# aws_session_token=SESSION_TOKEN)
if not LOCAL:
    boto3.setup_default_session(profile_name='team4-dev')
    s3_client = boto3.client('s3')
else:
    if not os.path.isdir('videos'):
        os.mkdir('videos')
    if not os.path.isdir('chats'):
        os.mkdir('chats')

if(TEST):
    DBNAME = 'Team4dbTest'

def list_buckets():
    """
    Lists all accessible S3 buckets.

    Returns:
        bool: True if listing is successful, False otherwise.
    """
    try:
        response = s3_client.list_buckets()
        print("Buckets accessible:")
        for bucket in response['Buckets']:
            print(f'{bucket["Name"]}')
        return True
    except Exception as e:
        print(f'Failed to list buckets: {e}')
        return False

 
# Not sure if this one is needed    
def create_bucket(bucket):
    """
    Creates a new S3 bucket with the specified name.

    Args:
        BUCKET (str): The name of the new bucket.

    Returns:
        bool: True if the bucket creation is successful, False otherwise.
    """
    location = {'LocationConstraint':'ca-central-1'}
    s3_client.create_bucket(Bucket=bucket,CreateBucketConfiguration=location)
    print("New bucket created")
    return True
    

def already_existing_file(obj_path):
    """
    Checks if an object already exists in the specified S3 bucket.

    Args:
        obj_path (str): The object key (path) to check.

    Returns:
        bool: True if the object exists, False otherwise.
    """
    if not LOCAL:
        try:
            s3_client.head_object(Bucket=BUCKETNAME, Key=obj_path)
            print(f"Object {obj_path} already exists in {BUCKETNAME}")
            return True
        except Exception as e:
            print(f"Object {obj_path} does not exist in {BUCKETNAME}")
            return False

    else:
        return os.path.exists(f'.{obj_path}')


def upload_file(file_content,store_as=None):
    """
    Uploads file content to an S3 bucket.

    Args:
        file_content (bytes): The content of the file to upload.
        store_as (str, optional): The object key (path) to store the file in S3.

    Returns:
        bool: True if the upload is successful, False otherwise.
    """
    if not LOCAL:
        try:
            if store_as is None:
                raise ValueError("store_as must be specified to upload a file")
           
            file_stream = BytesIO(file_content.encode("UTF-8"))

            s3_client.upload_fileobj(file_stream, BUCKETNAME, store_as)
            return True
        except Exception as e:
            print(f"Failed to upload file content to {BUCKETNAME}/{store_as}: {e}")
            return False

    else:
        try:
            if store_as is None:
                raise ValueError("store_as must be specified to upload a file")
            with open(f'.{store_as}', 'w') as f:
                f.write(file_content)
            return True
        except Exception as e:
            print(f"Failed to upload file content to {BUCKETNAME}/{store_as}: {e}")
            return False

    
def download_files(path_to_download, save_as=None):
    """
    Downloads a file from an S3 bucket.

    Args:
        path_to_download (str): The object key (path) of the file to download.
        save_as (str, optional): The local path to save the downloaded file.

    Returns:
        bool: True if the download is successful, False otherwise.
    """
    if not LOCAL:
        try:
            obj_to_dl = path_to_download
            s3_client.download_file(BUCKETNAME,obj_to_dl, save_as)
            return True
        except Exception as e:
            print(f"Failed to download {path_to_download}: {e}")
            return False

    else:
        try:
            import shutil
            shutil.copyfile(f'.{path_to_download}', save_as)
            return True
        except Exception as e:
            print(f'Failed to copy from {path_to_download} to {save_as}: {e}')
            return False


def get_object_content(obj_path):
    if not LOCAL:
        try:
            response = s3_client.get_object(Bucket=BUCKETNAME, Key=obj_path)

            content = response['Body'].read().decode('utf-8')

            print(f'Content of {obj_path}:\n{content}')
            return content
        except Exception as e:
            print(f"Error retrieving content from {obj_path}: {e}")
            return None

    else:
        try:
            with open(f'.{obj_path}', 'rb') as read_file:
                return read_file.read()
        except Exception as e:
            print(f"Error retrieving content from {obj_path}: {e}")
            return None


def get_metadata(obj_path):
    """
    Retrieves metadata for a specified object in an S3 bucket.

    Args:
        BUCKETNAME (str): The name of the S3 bucket.
        obj_path (str): The object key (path) for which to retrieve metadata.

    Returns:
        dict: Metadata of the specified object.
    """
    try:
        response = s3_client.head_object(Bucket=BUCKETNAME, Key=obj_path)
        return response.get('Metadata', {})
    except Exception as e:
        print(f'Error getting metadata for {obj_path}: {e}')
        return {}
    
    
def list_objs():
    """
    Lists all objects in a specified S3 bucket.

    Returns:
        bool: True if listing is successful, False otherwise.
    """
    try:
        response = s3_client.list_objects(Bucket=BUCKETNAME)
        
        print(f"Objects in {BUCKETNAME}")
        for obj in response.get('Contents',[]):
            print(obj['Key'])

        return True
    
    except Exception as e:
        print(f"Failed to list objs in {BUCKETNAME}: {e}")
        return False
    
    
def delete_file(obj_path):
    """
    Deletes a file from an S3 bucket.

    Args:
        BUCKETNAME (str): The name of the S3 bucket.
        obj_path (str): The object key (path) of the file to delete.

    Returns:
        bool: True if the deletion is successful, False otherwise.
    """
    try:
        s3_client.delete_object(Bucket=BUCKETNAME, Key=obj_path)
        print("File deleted")
        return True
    except Exception as e:
        print(f'Error deleting file {obj_path}: {e}')
        return False


def encrypt_insert(file_flag, file_content, file_name, retDate, senderEmail, receiverEmail, senderEncryption, receiverEncryption):
    """
    This handles the insertion of videos into the database but also the s3 bucket. It makes sure that both work before commiting into the database

    Args:
        BUCKETNAME (str): The bucket to target for s3
        file_content (bytes): The file after being encrypted 
        obj_path (str): the path for the obj to be saved under  
        retDate(dateTime): The date to delete
        senderId(int): The id of the current user trying to submit the video
        receiverUserName: The user name of the target person to view the video
        encrpytKey: The public key of the sender 
        file_flag: sets the folder to be saved into 
    """
    db = None
    result = 0
    subDate = datetime.now(timezone.utc)
    try:
        with SSHTunnelForwarder((SSH_TUNNEL_ADDRESS), 
                ssh_username=SSHUSER,
                ssh_pkey=KPATH, 
                remote_bind_address=(ADDRESS,PORT)
        )as tunnel:
            print("SSH Tunnel Established")
            #Db connection string
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=DBNAME)
            if db:
                if db:
                    cur = db.cursor()
                    query1 = f"START TRANSACTION"
                    cur.execute(query1)
                    
                    recQuery = "SELECT id, firstname, lastname FROM userprofile WHERE email LIKE %s"
                    cur.execute(recQuery,(receiverEmail,))
                    recInfo = cur.fetchall()
                    
                    if recInfo:
                        recID = recInfo[0][0]
                        recFname = recInfo[0][1]
                        recLname = recInfo[0][2]
                        obj_path = f"/{file_flag}/{receiverEmail}/{file_name}"
                        if LOCAL:
                            if not os.path.isdir(f"{file_flag}/{receiverEmail}"):
                                os.mkdir(f"{file_flag}/{receiverEmail}")
                    else:
                        raise ValueError("That email was not found.")
                    
                    # Checks to see if guest or not
                    if senderEmail:
                        userQuery = "SELECT id, firstname, lastname from userprofile WHERE email = %s"
                        cur.execute(userQuery,(senderEmail,))
                        userInfo = cur.fetchall()
                        
                        if userInfo:
                            senderId = userInfo [0][0]
                            userFname = userInfo[0][1]
                            userLname = userInfo[0][2]
                        else:
                            raise ValueError("Error retrieving current users information.")
                        
                        if file_flag == "videos":
                            insertQuery = "INSERT INTO videos (videoName, subDate, retDate, senderEmail, senderFName, senderLName, receiverEmail, senderEncryption, receiverEncryption) VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                            data = (file_name, subDate, retDate, senderEmail, userFname, userLname, receiverEmail, senderEncryption, receiverEncryption)
                            cur.execute(insertQuery, data)
                            
                        elif file_flag == "chats":  
                            insertQuery = "INSERT INTO chats (chatName, timestamp, senderEmail, senderFName, senderLName, receiverEmail, receiverFirstName, receiverLastName, senderEncryption, receiverEncryption, retDate) VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s)"
                            data = (file_name, subDate, senderEmail, userFname, userLname, receiverEmail, recFname, recLname, senderEncryption, receiverEncryption, retDate)
                            cur.execute(insertQuery, data)
                            
                        proceed = already_existing_file(obj_path)
                        if(not proceed):
                            upload_file(file_content,store_as=obj_path)
                            db.commit()
                            cur.close()
                            result = True
                        else:
                            db.rollback()
                            result = False
                    #If guest it does the same calls just without senderId
                    else: 
                        if file_flag == 'videos':       
                            insertQuery = "INSERT INTO videos (videoName, subDate, retDate, receiverEmail, receiverEncryption) VALUES ( %s, %s, %s, %s, %s)"
                            data = (file_name, subDate, retDate, receiverEmail, receiverEncryption)
                            cur.execute(insertQuery, data)
                            
                        elif file_flag == 'chats':       
                            insertQuery = "INSERT INTO chats (chatName, timestamp, retDate, receiverEmail, receiverFirstName, receiverLastName, receiverEncryption) VALUES ( %s, %s, %s, %s, %s, %s, %s)"
                            data = (file_name, subDate, retDate, receiverEmail, recFname, recLname, receiverEncryption)
                            cur.execute(insertQuery, data)
                            
                        proceed = already_existing_file(obj_path)
                        if(not proceed):
                            upload_file(file_content,store_as=obj_path)
                            db.commit()
                            cur.close()
                            result = True
                        else:
                            db.rollback()
                            result = False      
    except Exception as e:
        print(e)
        db.rollback()
        result = False
    finally:
        if db:
            db.close()
        return result


if __name__ == "__main__":
    list_buckets()
    list_objs()
    encrypt_insert("videos",'test test file for encrpyt', 'testFile34.txt', "2022-01-22 11:59:00", "Test@example.com", "Test@example.com","234234234asd" ,"as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    get_object_content("tests/Guest/testFile2.txt")
    delete_file('tests/Test@example.com/testFile.txt')
    delete_file('tests/Guest/testFile2.txt')
