import pymysql
from sshtunnel import SSHTunnelForwarder
import dbConfig

# def connect_to_db():
#     try:
#         with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=dbConfig.ssh_username,ssh_pkey=dbConfig.key_Path, remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com',3306)) as tunnel:
#            # print("SSH Tunnel Established")
#             db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)

#             return db
#     except pymysql.Error as e:
#         print(e)
#         return None


def insert_user(username:str, email:str, password:str, firstname:str, lastname:str) -> int:
    '''
    Insert a new user into the database.

    Args:
        username (str): The username of the new user.
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
        result = insert_user("new_username", "new_email", "hashed_password", "John", "Doe")
    '''
    db = None
    result = None
    try:
        # Creates the SSH tunnel to connect to the DB
        with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=dbConfig.ssh_username,ssh_pkey=dbConfig.key_Path, remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com',3306)) as tunnel:

            print("SSH Tunnel Established")
            #Db connection string
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
            if db:
                cur = db.cursor()
                #Insert String
                query = "INSERT INTO userprofile (username, email, password_hash, firstname, lastname) values (%s,%s,%s,%s,%s)"
                #Creates list of the insertations 
                data = (username,email,password,firstname,lastname)
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


def insert_video(subDate:str, retDate:str, senderID:str, recieverID:str) -> int:
    '''
    Insert a new video into the database.

    Args:
        subDate (str): The username of the new user.
        retDate (str): The email address of the new user.
        senderID (int): The hashed password of the new user.
        recieverID (int): The last name of the new user.

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
        with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=dbConfig.ssh_username,ssh_pkey=dbConfig.key_Path, remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com',3306)) as tunnel:

            print("SSH Tunnel Established")
            #Db connection string
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
            if db:
                cur = db.cursor()
                #Insert String
                query = "INSERT INTO videos (subDate, retDate, senderID, recieverID) values (%s,%s,%s,%s)"
                #Creates list of the insertations 
                data = (subDate, retDate, senderID, recieverID)
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
        with SSHTunnelForwarder(
            ('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'),
            ssh_username=dbConfig.ssh_username,
            ssh_pkey=dbConfig.key_Path,
            remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com', 3306)
        ) as tunnel:
            print("SSH Tunnel Established")
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
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
        with SSHTunnelForwarder(
            ('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'),
            ssh_username=dbConfig.ssh_username,
            ssh_pkey=dbConfig.key_Path,
            remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com', 3306)
        ) as tunnel:
            print("SSH Tunnel Established")
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
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
        with SSHTunnelForwarder(
            ('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'),
            ssh_username=dbConfig.ssh_username,
            ssh_pkey=dbConfig.key_Path,
            remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com', 3306)
        ) as tunnel:
            print("SSH Tunnel Established")
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
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
    
    
def authenticate(username: str, password: str) -> bool: 
    """
    Authenticate a user by checking if the provided password matches the password stored in the database.

    Args:
        username (str): The username of the user to authenticate.
        password (str): The password provided by the user for authentication.

    Returns:
        bool: True if authentication is successful (password matches), otherwise False.
    """
    db = None

    try:
        with SSHTunnelForwarder(
            ('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'),
            ssh_username=dbConfig.ssh_username,
            ssh_pkey=dbConfig.key_Path,
            remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com', 3306)
        ) as tunnel:
            print("SSH Tunnel Established")
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
            if db:
                cur = db.cursor()
                query = "SELECT password_hash FROM userprofile WHERE username = %s"
                cur.execute(query, (username,))
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
        with SSHTunnelForwarder(
            ('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'),
            ssh_username=dbConfig.ssh_username,
            ssh_pkey=dbConfig.key_Path,
            remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com', 3306)
        ) as tunnel:
            print("SSH Tunnel Established")
            db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
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