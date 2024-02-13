import pymysql
from sshtunnel import SSHTunnelForwarder
import os 
from dotenv import load_dotenv
import sys 
from datetime import datetime, timezone

sys.path.append(os.path.abspath('../app'))
load_dotenv('myenv.env')
SSHUSER = os.getenv("SSHUSER")
KPATH = os.getenv("KEYPATH")
ADDRESS = os.getenv("ADDRESS")
PORT = int(os.getenv("PORT"))
DBUSER = os.getenv("DBUSER")
DBPASS = os.getenv("PASS")
HOST = os.getenv("HOST")
DBNAME = os.getenv("MYDB")
TEST = os.getenv("TEST")
SSH_TUNNEL_ADDRESS = os.getenv("EC2_ADDRESS")

if(TEST.lower() == "true"):
    DBNAME = 'Team4dbTest'

def insert_user(email:str, password:str, firstname:str, lastname:str, salthash, pubKey) -> int:
    '''
    Insert a new user into the database.

    Args:
        email (str): The email address of the new user.
        password (str): The hashed password of the new user.
        firstname (str): The first name of the new user.
        lastname (str): The last name of the new user.

    Returns:
        int: An integer result code indicating the outcome of the insertion operation.
             - 1: Insertion was successful.
             - -1: An error occurred during insertion.

    Example:
        # Example usage to insert a new user into the database
        result = insert_user("new_email", "hashed_password", "John", "Doe")
    '''
    db = None
    result = None
    try:
        # Creates the SSH tunnel to connect to the DB
            with SSHTunnelForwarder((SSH_TUNNEL_ADDRESS), ssh_username=SSHUSER,ssh_pkey=KPATH, remote_bind_address=(ADDRESS,PORT)) as tunnel:
                print("SSH Tunnel Established")
                #Db connection string
                db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=DBNAME)
                if db:
                    cur = db.cursor()
                    #Insert String
                    query = "INSERT INTO userprofile (email, password_hash, firstname, lastname,salthash, publickey) values (%s,%s,%s,%s,%s,%s)"
                    #Creates list of the insertations
                    data = (email,password,firstname,lastname, salthash, pubKey)
                    #Executes the query w/ the corrosponding data
                    cur.execute(query,data)
                    print("Insertation Complete")
                    db.commit()
                    #Returns 1 if successful
                    result = 1
    #except pymysql.Error as e:
    except Exception as e:
        print(e)
        # Returns 1 if errors
        result = -1
    finally:
        if db:
            db.close()
        # Returns what 1 or -1 
        return result


def insert_video(videoName:str, retDate:datetime, senderEmail:str, receiverEmail:str, senderEncryption, receiverEncryption) -> int:
    '''
    Insert a new video into the database.

    Args:
        subDate (str): The username of the new user.
        retDate (str): The email address of the new user.
        senderID (int): The hashed password of the new user.
        receiverID (int): The last name of the new user.

    Returns:
        int: An integer result code indicating the outcome of the insertion operation.
             - 1: Insertion was successful.
             - -1: An error occurred during insertion.

    Example:
        # Example usage to insert a new video into the database
        result = insert_video("29-10-23T10:34:09", "01-01-24T01:00:00", "1", "2")
    '''
    db = None
    result = None
    
    try:
        # Creates the SSH tunnel to connect to the DB
        with SSHTunnelForwarder((SSH_TUNNEL_ADDRESS), ssh_username=SSHUSER,ssh_pkey=KPATH, remote_bind_address=(ADDRESS,PORT)) as tunnel:
            print("SSH Tunnel Established")
            #Db connection string
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database=DBNAME)
            if db:
                cur = db.cursor()
                subDate = datetime.now(timezone.utc)
                retDate = datetime.strptime(retDate,'%Y-%m-%d %H:%M:%S')
                #Insert String
                query = "INSERT INTO videos(videoName, subDate, retDate, senderEmail, receiverEmail, senderEncryption, receiverEncryption) values (%s, %s, %s, %s, %s, %s, %s)"
                #Creates list of the insertations 
                data = (videoName, subDate, retDate, senderEmail, receiverEmail, senderEncryption, receiverEncryption)
                #Executes the query w/ the corrosponding data
                cur.execute(query,data)
                print("Insertation Complete")
                db.commit()
                #Returns 1 if successful
                result = 1
    #except pymysql.Error as e:
    except Exception as e:
        print(e)
        # Returns 1 if errors
        result = -1
    finally:
        if db:
            db.close()
        # Returns what 1 or -1 
        return result


def update_user(user_id:int,new_data:dict) -> int:
    '''
    Update user information in the database.

    Args:
        user_id (int): The unique identifier of the user to be updated.
        update_data (dict): A dictionary containing key-value pairs of fields to be updated.
                            The keys represent the database columns, and the values represent
                            the new values for those columns.

    Returns:
        int: An integer result code indicating the outcome of the update operation.
             - 1: Update was successful.
             - -1: An error occurred during the update.

    Example:
        # Example usage to update the username and email fields for a user with user_id=1
        update_data = {
            "username": "new_username",
            "email": "new_email"
        }
    '''
    db = None
    result = 0  # Initialize the result to 0
    
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
                cur = db.cursor()

                # Construct the SET clause dynamically based on the update_data dictionary
                set_clause = ", ".join(f"{field} = %s" for field in new_data.keys())

                query = f"UPDATE userprofile SET {set_clause} WHERE id = %s"
                
                # Append the user_id to the values list
                new_data["user_id"] = user_id

                data = list(new_data.values())  # Convert the values from the dictionary to a list
                cur.execute(query, data)
                db.commit()
                cur.close()
                result = 1  # Set result to 1 to indicate success
    except Exception as e:
        print(e)
        result = -1  # Set result to -1 to indicate an error
    finally:
        if db:
            db.close()

    return result  # Return the result


def query_records(table_name: str, fields: str, condition: str = "", condition_values: tuple = ()) -> list:
    """
    Retrieve records from a table based on specified fields and optional conditions.

    Args:
        table_name (str): The name of the table from which records will be retrieved.
        fields (str): Comma-separated list of fields to retrieve (e.g., "field1, field2").
        condition (str, optional): The WHERE clause condition for filtering records.
        condition_values (tuple, optional): Values to replace placeholders in the condition.

    Returns:
        list: A list of dictionaries, where each dictionary represents a row of data.

    Example:
        # Retrieve all records from the 'userprofile' table
        records = query_records("userprofile", "username, email, firstname, lastname")

    """
    db = None
    records = []
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
                cur = db.cursor()
                query = f"SELECT {fields} FROM {table_name}"
                if condition:
                    query += f" WHERE {condition}"
                cur.execute(query, condition_values)
                records = [dict(zip([desc[0] for desc in cur.description], row)) for row in cur.fetchall()]
    except Exception as e:
        print(e)
    finally:
        if db:
            db.close()
        return records
    
    
def delete_record(table_name: str, condition: str, condition_values: tuple) -> int:
    """
    Delete records from a table based on a condition.

    Args:
        table_name (str): The name of the table from which records will be deleted.
        condition (str): The WHERE clause condition for deletion.
        condition_values (tuple): Values to replace placeholders in the condition.

    Returns:
        int: An integer result code indicating the outcome of the deletion operation.
             - 1: Deletion was successful.
             - -1: An error occurred during deletion.
    """
    db = None
    result = 0

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
                cur = db.cursor()
                query = f"DELETE FROM {table_name} WHERE {condition}"
                cur.execute(query, condition_values)
                db.commit()
                cur.close()
                result = 1
    except Exception as e:
        print(e)
        result = -1
    finally:
        if db:
            db.close()
        return result
    
    
def authenticate(email: str, password: str) -> bool: 
    """
    Authenticate a user by checking if the provided password matches the password stored in the database.

    Args:
        email (str): The email of the user to authenticate.
        password (str): The password provided by the user for authentication.

    Returns:
        bool: True if authentication is successful (password matches), otherwise False.
    """
    db = None
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
                cur = db.cursor()
                query = "SELECT password_hash FROM userprofile WHERE email = %s"
                cur.execute(query, (email,))
                stored_password = cur.fetchone()

                if stored_password and stored_password[0] == password:
                    return True  # Authentication successful
    except Exception as e:
        print(e)
    finally:
        if db:
            db.close()

    return False  # Authentication failed


def resetTable(tableName:str)-> bool:
    db = None
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
                cur = db.cursor()
                query = f"SET FOREIGN_KEY_CHECKS = 0"
                cur.execute(query)
                query = f"TRUNCATE TABLE {tableName}"
                cur.execute(query)
                query = f"ALTER TABLE {tableName} AUTO_INCREMENT = 1;"
                cur.execute(query)
                query = f"SET FOREIGN_KEY_CHECKS = 1"
                cur.execute(query)
                return True  # Reset successful
    except Exception as e:
        print(e)
    finally:
        if db:
            db.close()
    return False  # Reset failed

def delete_key(videoName:str,sender:bool,receiver:bool) -> int:
    '''
    Zeros out a user's key so they can no longer access a video

    Args:
        videoName(str): The video's name where the key will be deleted
        sender(bool): true if the user is the sender
        reciever(bool): true if the user is the reciever

    Returns:
        int: An integer result code indicating the outcome of the delete operation.
             - 1: Delete was successful.
             - -1: An error occurred during the delete.
    '''
    db = None
    result = 0  # Initialize the result to 0
    
    try:
        with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=SSHUSER,ssh_pkey=KPATH, remote_bind_address=(ADDRESS,PORT)) as tunnel:
            print("SSH Tunnel Established")
            #Db connection string
            db = pymysql.connect(host=HOST, user=DBUSER, password=DBPASS, port=tunnel.local_bind_port, database='Team4dbTest')
            if db:
                cur = db.cursor()
                #Create set clause depending on whether user is sender or receiver
                if (sender):
                    set_clause = "senderEncryption = 0, senderEmail = NULL"
                elif (receiver):
                    set_clause = "recieverEncryption = 0, receiverEmail = NULL"
                else:
                    result = -1
                query = f"UPDATE videos SET {set_clause} WHERE videoName = %s"
                cur.execute(query, videoName)   
                # Check if video has chats associated with it and removes user's access
                query_results = query_records(table_name = 'chats', fields ='*', condition=f'chatName = %s', condition_values = (videoName,))
                if query_results:
                    query2 = f"UPDATE chats SET {set_clause} WHERE chatName = %s"
                    cur.execute(query2, videoName) 
                cur.close()
                result = 1  # Set result to 1 to indicate success
    except Exception as e:
        print(e)
        result = -1  # Set result to -1 to indicate an error
    finally:
        if db:
            db.close()
    return result  # Return the result