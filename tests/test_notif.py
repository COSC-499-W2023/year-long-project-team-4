import pytest
import time
import sys
import os

sys.path.append(os.path.abspath('../app'))

import notification

def test_get_email():
    result1 = notification.get_email("/tests/06610ff0-6f17-4b03-acb8-87168b39956a") 
    assert result1 == "test123@gmail.com"
    
def test_send_email():
    assert notification.send_email("fakeusertest987@gmail.com") == 1 
    
if __name__ == "__main__":
    start_time = time.time()
    test_get_email()
    test_send_email()   
    end_time = time.time()
    print("Time taken: ",end_time - start_time,"seconds")
