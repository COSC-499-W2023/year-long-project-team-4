import pytest
import databaseUtil as dbUtil
import time

def test_reset():
    assert dbUtil.resetTable("userprofile") is True

def test_insert():
    result1 = dbUtil.insert_user("test_user", "updated@example.com", "password123", "John", "Doe")
    result2 = dbUtil.insert_user("MadeUpUser", "Test@example.com", "password12233", "John", "Doe")

    assert result1 == 1  # Assuming insertion was successful
    assert result2 == 1  # Assuming insertion was successful


def test_update():
    update_data = {
        "username": "updated_user",
        "email": "Testingupdate@example.com"
    }
    result = dbUtil.update_user(1, update_data)  # Assuming user_id 1 exists
    assert result == 1  # Assuming the update was successful

def test_authenticate():
    assert dbUtil.authenticate("updated_user", "password123") is True  # Assuming correct username and password
    assert dbUtil.authenticate("MadeUpUser", "wrong_password") is False  # Assuming incorrect username and password 

def test_delete():
    result = dbUtil.delete_record("userprofile", "id = %s", (1,))  # Assuming user_id 1 exists
    assert result == 1  # Assuming the deletion was successful
       
       
if __name__ == "__main__":
    
    start_time = time.time()
    test_reset()
    test_insert()
    test_update()
    test_authenticate()
    test_delete()   
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")
    