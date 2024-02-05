/* Regular DB script */
DROP DATABASE IF EXISTS Team4db;

CREATE DATABASE Team4db;

USE Team4db;

CREATE TABLE userprofile (
	id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(50) UNIQUE,
	email VARCHAR (100) UNIQUE,
	password_hash VARCHAR (255),
	firstname VARCHAR (50),
	lastname VARCHAR (50),
	salthash VARBINARY(128),
	publickey VARCHAR(500),
	verifyKey VARCHAR(10)
);

CREATE TABLE videos (
    videoName VARCHAR(100) PRIMARY KEY,
    subDate DATETIME,
    retDate DATETIME,
    senderEmail VARCHAR(100),
    senderFName VARCHAR(50),
    senderLName VARCHAR(50),
    receiverEmail VARCHAR(100),
    senderEncryption VARCHAR(500),
	receiverEncryption VARCHAR(500),
    FOREIGN KEY (receiverEmail) REFERENCES userprofile(email) ON DELETE CASCADE
);

CREATE TABLE forms (
	formID int PRIMARY KEY,
	subDate DATETIME,
	senderID int,
	receiverID int,
	encrpyt VARCHAR(500),
    FOREIGN KEY (receiverID) REFERENCES userprofile(id) ON DELETE CASCADE
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
	FOREIGN KEY (senderEmail) REFERENCES userprofile(email) ON DELETE CASCADE,
    FOREIGN KEY (receiverEmail) REFERENCES userprofile(email) ON DELETE CASCADE
);
