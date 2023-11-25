import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import database
import s3Bucket

def test_passed_retDates():
    result1 = database.get_passed_retDates()
    
    assert result1 != -1
    
    # Can't test for actual videoNames with passed retDates because videoNames are random/unkown before calling this function

    
def test_retention_delete():
    database.insert_video("29-10-23T10:34:09", "01-01-22T01:00:00", "1", "2", True) # Insert videos with passed retention dates
    database.insert_video("29-10-23T10:34:09", "01-01-22T01:00:00", "2", "1", True)
    database.insert_video("29-10-23T10:34:09", "01-01-22T01:00:00", "1", "2", True)
    
    result1 = database.retention_delete('videoName = %s', ('TestFile.txt',), 'TestFile.txt', True)
    
    assert  result1 == 1 # Assuming insert was successful
    
def test_ret():
    
    result1 = database.retention(True)
    
    assert  result1 == True
    
    
if __name__ == "__main__":
    
    start_time = time.time()
    test_passed_retDates()
    test_retention_delete()
    test_ret()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")
    