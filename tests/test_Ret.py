import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import database
import s3Bucket

def test_passed_retDates():
    result1 = database.get_passed_retDates()
    
    database.insert_video("29-10-23T10:34:09", "01-01-22T01:00:00", "1", "2", True) # Insert videos with passed retention dates
    database.insert_video("29-10-23T10:34:09", "01-01-22T01:00:00", "2", "1", True)
    database.insert_video("29-10-23T10:34:09", "01-01-22T01:00:00", "1", "2", True)
    
    result2 = database.get_passed_retDates(True)
    
    assert result1 == '[]'
    assert result2 == '[1, 2, 3]' # Assuming insertion was successful
    
def test_retention_delete():
    result1 = database.retention_delete("videoID = %s", (1,), "TestFile.txt", True)
    
    assert  result1 == 1
    
def test_ret():
    result1 = database.retention(True)
    
    assert  result1 == False
    
    