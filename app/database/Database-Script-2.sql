INSERT INTO videos (senderFName, senderLName)
SELECT 'firstame', 'lastname' FROM userprofile
WHERE 'id' = 'senderID' ;