import pymysql
from sshtunnel import SSHTunnelForwarder
import dbConfig


with SSHTunnelForwarder(('ec2-15-156-66-147.ca-central-1.compute.amazonaws.com'), ssh_username=dbConfig.ssh_username,ssh_pkey=dbConfig.key_Path, remote_bind_address=('team4-db.cc4e8pqxmsac.ca-central-1.rds.amazonaws.com',3306)) as tunnel:
    print("SSH Tunnel Established")
    db = pymysql.connect(host=dbConfig.HOST, user=dbConfig.USER, password=dbConfig.PASS, port=tunnel.local_bind_port, database=dbConfig.MYDB)
    
    try:
          # Print all the databases
        with db.cursor() as cur:
            # Print all the tables from the database
            cur.execute('SHOW TABLES FROM Team4db')
            for r in cur:
                print(r)
                
    finally:
        db.close()
        