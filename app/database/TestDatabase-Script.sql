/* TEST DB script */
DROP DATABASE IF EXISTS Team4dbTest;

CREATE DATABASE Team4dbTest;

USE Team4dbTest;

CREATE TABLE userprofile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR (100) UNIQUE,
    password_hash VARCHAR (255),
    firstname VARCHAR (50),
    lastname VARCHAR (50),
    salthash VARBINARY(128),
    publickey VARCHAR(500),
    verifyKey VARCHAR(10),
    verifiedAcc BOOLEAN
);

CREATE TABLE videos (
    videoID VARCHAR(100) PRIMARY KEY,
    videoName VARCHAR(100),
    subDate DATETIME,
    retDate DATETIME,
    senderEmail VARCHAR(100),
    senderFName VARCHAR(50),
    senderLName VARCHAR(50),
    receiverEmail VARCHAR(100),
    senderEncryption VARCHAR(500),
    receiverEncryption VARCHAR(500),
    FOREIGN KEY (senderEmail) REFERENCES userprofile(email) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (receiverEmail) REFERENCES userprofile(email) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE chats (
    chatName VARCHAR(100) PRIMARY KEY,
    timestamp DATETIME,
    senderEmail VARCHAR(100),
    senderFName VARCHAR(50),
    senderLName VARCHAR(50),
    receiverEmail VARCHAR(100),
    receiverFirstName VARCHAR(100),
    receiverLastName VARCHAR(100),
    senderEncryption VARCHAR(500),
    receiverEncryption VARCHAR(500),
    retDate DATETIME,
    FOREIGN KEY (senderEmail) REFERENCES userprofile(email) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (receiverEmail) REFERENCES userprofile(email) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE tags (
    tagName VARCHAR(20),
    videoID VARCHAR(100),
    FOREIGN KEY (videoID) REFERENCES videos(videoID) ON DELETE CASCADE ON UPDATE CASCADE
);