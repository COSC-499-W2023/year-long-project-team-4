import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import s3Bucket
import database

def test_list_buckets():
    assert s3Bucket.list_buckets() is True
  
def test_upload_file():
    result1 = s3Bucket.upload_file('This is test content', 'testFile.txt')
    result2 = s3Bucket.upload_file('This is test content', 'tests/Guest/testFile2.txt')
    assert result1 == True
    assert result2 == True
    
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
    database.insert_user("Test@example.com", "password12233", "John", "Doe","","")
    result1 = s3Bucket.encrypt_insert("videos",'test test file for encrpyt', 'testFile34.txt', "2022-01-22 11:59:00", "Test@example.com", "Test@example.com", "213asdada","as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    result2 = s3Bucket.encrypt_insert("chats",'test test file for encrpyt', 'testFile34.txt', "2022-01-22 11:59:00", "Test@example.com", "Test@example.com", "213asdada","as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs")
    result3 = s3Bucket.encrypt_insert(file_flag="chats",file_content='test test file for encrpyt', file_name='testFile30.txt', retDate= "2022-01-22 11:59:00",senderEmail=None, receiverEmail="Test@example.com", senderEncryption="as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs", receiverEncryption="2asdad")
    result4 = s3Bucket.encrypt_insert(file_flag="videos",file_content='test test file for encrpyt', file_name='testFile30.txt', retDate= "2022-01-22 11:59:00",senderEmail=None, receiverEmail="Test@example.com", senderEncryption="as4sdfskrw34erkwxjkdfh#wsdf#sflh!*7sdfs", receiverEncryption="2asdad")

    assert result1 == True
    assert result2 == True
    assert result3 == True
    assert result4 == True
    
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
