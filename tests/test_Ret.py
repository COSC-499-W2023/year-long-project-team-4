import pytest
import time
import sys
import os
import boto3
from io import BytesIO

sys.path.append(os.path.abspath('../app'))
import database
import s3Bucket

def test_reset():
    assert database.resetTable("userprofile") is True
    assert database.resetTable("videos") is True
    
    # Added this in since we refresh the table, we want to make sure there are user IDs for receivers
    database.insert_user("updated@example.com", "password123", "John", "Doe","","","")
    database.insert_user("Test@example.com", "password12233", "John", "Doe","","","")
    
def test_passed_retDates():
    result1 = database.get_passed_retDates()
    
    assert result1 != -1
    
    # Can't test for actual videoNames with passed retDates because videoNames are random/unkown before calling this function
    
def test_retention_delete():
    database.insert_video("TestGuest.mp4", "Testname", "2024-01-24 11:59:00",None, "Test@example.com","1","2")
    s3Bucket.upload_file('This is test content', 'TestGuest.mp4')
    
    result1 = database.retention_delete('videoName = %s', ('TestGuest.mp4',), 'TestGuest.mp4')
    
    assert  result1 == 1 # Assuming insert was successful
    
def test_ret():
    database.insert_video("Test.mp4", "Testname","2024-01-24 11:59:00", "updated@example.com", "Test@example.com","1","2")
    s3Bucket.upload_file('This is test content', "Test.mp4")
    
    result1 = database.retention()
    
    assert  result1 > 0
    
    
if __name__ == "__main__":
    
    start_time = time.time()
    test_reset()
    test_passed_retDates()
    test_retention_delete()
    test_ret()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")
    