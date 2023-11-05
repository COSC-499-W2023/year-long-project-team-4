import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import database


def test_reset():
    assert database.resetTable(True, "userprofile") is True
    assert database.resetTable(True, "videos") is True

def test_insert_user():
    result1 = database.insert_user(True,"test_user", "updated@example.com", "password123", "John", "Doe")
    result2 = database.insert_user(True,"MadeUpUser", "Test@example.com", "password12233", "John", "Doe")

    assert result1 == 1  # Assuming insertion was successful
    assert result2 == 1  # Assuming insertion was successful

def test_insert_video():
    result = database.insert_video(True,"29-10-23T10:34:09", "01-01-24T01:00:00", "1", "2")

    assert result == 1  # Assuming insertion was successful

def test_update():
    update_data = {
        "username": "updated_user",
        "email": "Testingupdate@example.com"
    }
    result = database.update_user(True, 1, update_data)  # Assuming user_id 1 exists
    assert result == 1  # Assuming the update was successful

def test_authenticate():
    assert database.authenticate(True, "updated_user", "password123") is True  # Assuming correct username and password
    assert database.authenticate(True, "MadeUpUser", "wrong_password") is False  # Assuming incorrect username and password 

def test_delete():
    result1 = database.delete_record(True, "userprofile", "id = %s", (1,))  # Assuming user_id 1 exists
    result2 = database.delete_record(True, "videos", "videoID = %s", (1,)) # Assuming user_id 1 exists
    assert result1 == 1  # Assuming the deletion was successful
    assert result2 == 1  # Assuming the deletion was successful
       
       
if __name__ == "__main__":
    
    start_time = time.time()
    test_reset()
    test_insert_user()
    test_insert_video()
    test_update()
    test_authenticate()
    test_delete()   
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")