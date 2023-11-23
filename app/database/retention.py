#import schedule
import sys,os
from databaseUtil import get_passed_retDates, delete_record

# Add scheduler to run file once a day

def retention_db():
    data = list(get_passed_retDates())
    for items in data:
        delete_record("videos", "videoID = %s", (data[items],),True)
        
# Connect to S3 and run delete? Or bucket delete runs S3 delete