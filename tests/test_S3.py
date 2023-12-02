import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import s3Bucket


def test_list_buckets():
    assert s3Bucket.list_buckets() is True
  
def test_upload_file():
    result1 = s3Bucket.upload_file('This is test content', 'testFile.txt')
    
    assert result1 == True
      
def test_existing_file():
    result1 = s3Bucket.already_existing_file('testFile.txt')
    result2 = s3Bucket.already_existing_file('notInBucket.txt')
    
    assert result1 == True #Assuming upload was successful
    assert result2 == False
    
def test_download_file():
    result1 = s3Bucket.download_files('testFile.txt','testFile.text')
    
    assert result1 == True #Assuming upload was successful
    
    
def test_delete_file():
    result1 = s3Bucket.delete_file('testFile.txt')
    
    assert result1 == True #Assuming upload was successful


# to properly test this file, you must make sure there is no duplicates in the s3 already (Call just s3_bucketUtils.py) 
#and reset the DB to make sure there are not duplicate obj_path names
def test_encrpyted_insert():
    result1 = s3Bucket.encrypt_insert("tests",'test test file for encrpyt', 'testFile.txt', "2022-01-22 11:59:00", "Test@example.com", "Test@example.com", "as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    result2 = s3Bucket.encrypt_insert("tests",file_content='test test file for encrpyt', obj_path='testFile2.txt', retDate= "2022-01-22 11:59:00", senderEmail = "", receiverEmail="Test@example.com", encryptKey="as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    assert result1 == True
    assert result2 == True

def test_get_object_content():
    result = s3Bucket.get_object_content('tests/Guest/testFile2.txt')
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
