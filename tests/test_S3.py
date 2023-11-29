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
    result1 = s3Bucket.download_files('team4-s3', 'testFile.txt','testFile.text')
    
    assert result1 == True #Assuming upload was successful
    
    
def test_delete_file():
    result1 = s3Bucket.delete_file("team4-s3", 'testFile.txt')
    
    assert result1 == True #Assuming upload was successful


# to properly test this file, you must make sure there is no duplicates in the s3 already (Call just s3_bucketUtils.py) 
#and reset the DB to make sure there are not duplicate obj_path names
def test_encrpyted_insert():
    result1 = s3Bucket.encrypt_insert("team4-s3",b'test test file for encrpyt', '/test/testFile.txt', "2022-01-22 11:59:00", 2, "Test@example.com", "as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    result2 = s3Bucket.encrypt_insert(bucket_name="team4-s3",file_content=b'test test file for encrpyt', obj_path='/test/testFile2.txt', retDate= "2022-01-22 11:59:00", senderId = "", receiverEmail="Test@example.com", encrpytKey="as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    assert result1 == True
    assert result2 == True

def test_get_object_content():
    result = s3Bucket.get_object_content('team4-s3','test/testFile.txt')
    assert result is not None

if __name__ == "__main__":
    
    start_time = time.time()
    test_list_buckets()
    test_upload_file()
    test_existing_file()
    test_download_file()
    test_delete_file()
    
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")
