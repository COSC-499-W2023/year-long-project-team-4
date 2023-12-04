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
    assert database.resetTable("userprofile",True) is True
    assert database.resetTable("videos",True) is True

def test_passed_retDates():
    result1 = database.get_passed_retDates()
    
    assert result1 != -1
    
    # Can't test for actual videoNames with passed retDates because videoNames are random/unkown before calling this function
    
def test_retention_delete():
    database.insert_video("Test3.mp4","2022-01-22 11:59:00", "3", "2","", True)
    s3Bucket.upload_file('This is test content', 'Test3.mp4')
    
    
    result1 = database.retention_delete('videoName = %s', ('Test3.mp4',), 'Test3.mp4')
    
    assert  result1 == 1 # Assuming insert was successful
    
def test_ret():
    database.insert_video("Test4.mp4","2022-01-22 11:59:00", "3", "2","", True)
    s3Bucket.upload_file('This is test content', 'Test4.mp4')
    
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
    