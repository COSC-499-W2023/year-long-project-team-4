import pymysql
from sshtunnel import SSHTunnelForwarder
import dbConfig
import databaseUtil

databaseUtil.insert_user("MadeUpUser","madeupUser@hotmail.com","PlainText Pass","Denis","Gauthier")

# with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=dbConfig.ssh_username,ssh_pkey=dbConfig.key_Path, remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com',3306)) as tunnel:
#     print("SSH Tunnel Established")
#     db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
    
#     try:
#           # Print all the databases
#         with db.cursor() as cur:
#             # Print all the tables from the database
#             query = 'INSERT INTO userprofile (username, email, password_hash, firstname, lastname) values (%s,%s,%s,%s,%s)'
#             data = ("DenisGa","madeup1@hotmail.com","Unhashedpassword12311","Den","Gauthier")
#             cur.execute(query,data)
#             print("Insertion complete")
                
#     finally:
#         db.close()
        