import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import s3Bucket


def test_list_buckets():
    assert s3Bucket.list_buckets() is True
  
def test_upload_file():
    result1 = s3Bucket.upload_file(b'This is test content', 'team4-s3', 'testFile.txt')
    
    assert result1 == True
      
def test_existing_file():
    result1 = s3Bucket.already_existing_file('team4-s3','testFile.txt')
    result2 = s3Bucket.already_existing_file('team4-s3','notInBucket.txt')
    
    assert result1 == True #Assuming upload was successful
    assert result2 == False
    
def test_download_file():
    result1 = s3Bucket.download_files('team4-s3', 'testFile.txt','/tmp/testFile.text')
    
    assert result1 == True #Assuming upload was successful
    
    
def test_delete_file():
    result1 = s3Bucket.delete_file("team4-s3", 'testFile.txt')
    
    assert result1 == True #Assuming upload was successful




if __name__ == "__main__":
    
    start_time = time.time()
    test_list_buckets()
    test_upload_file()
    test_existing_file()
    test_download_file()
    test_delete_file()
    
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")
