import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))
import database

def test_reset():
    assert database.resetTable("userprofile") is True
    assert database.resetTable("videos") is True

def test_insert_user():
    result1 = database.insert_user("test_user", "updated@example.com", "password123", "John", "Doe","","")
    result2 = database.insert_user("MadeUpUser", "Test@example.com", "password12233", "John", "Doe","","")

    assert result1 == 1  # Assuming insertion was successful
    assert result2 == 1  # Assuming insertion was successful

def test_insert_video():
    result = database.insert_video("Test.mp4", "2024-01-24 11:59:00", "updated@example.com", "Test@example.com","1","2")

    assert result == 1  # Assuming insertion was successful

def test_update():
    update_data = {
        "username": "updated_user",
        "email": "Testingupdate@example.com"
    }
    result = database.update_user(1, update_data)  # Assuming user_id 1 exists
    assert result == 1  # Assuming the update was successful

def test_authenticate():
    assert database.authenticate("updated_user", "password123") is True  # Assuming correct username and password
    assert database.authenticate("MadeUpUser", "wrong_password") is False  # Assuming incorrect username and password 

def test_delete():
    result1 = database.delete_record("userprofile", "id = %s", (1,))  # Assuming user_id 1 exists
    result2 = database.delete_record("videos", "videoName = %s", ('Test.mp4',)) # Assuming user_id 1 exists
    assert result1 == 1  # Assuming the deletion was successful
    assert result2 == 1  # Assuming the deletion was successful
    
def test_delete_key():
    database.insert_video("TestDeleteKey.mp4", "2024-01-24 11:59:00", "updated@example.com", "Test@example.com","1","2")
    result = database.delete_key("TestDeleteKey.mp4", sender = True, receiver = False)
    assert result == 1  # Assuming the delete was successful
       
       
if __name__ == "__main__":
    
    start_time = time.time()
    test_reset()
    test_insert_user()
    test_insert_video()
    test_update()
    test_authenticate()
    test_delete()   
    test_delete_key()
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")