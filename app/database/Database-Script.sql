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
	publickey VARCHAR(500)
);

CREATE TABLE videos (
    videoName VARCHAR(100) PRIMARY KEY,
    subDate DATETIME,
    retDate DATETIME,
    senderID INT,
    senderFName VARCHAR(50),
    senderLName VARCHAR(50),
    receiverID INT,
    encrpyt VARCHAR(500),
    FOREIGN KEY (receiverID) REFERENCES userprofile(id) ON DELETE CASCADE
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
	chatLogID INT PRIMARY KEY,
	timestamp DATETIME,
	senderID int,
	receiverID int,
	encrpyt VARCHAR(500),
	retDate DATETIME,
	FOREIGN KEY (senderID) REFERENCES userprofile(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverID) REFERENCES userprofile(id) ON DELETE CASCADE
);


/*Test Db script*/

DROP DATABASE IF EXISTS Team4dbTest;

CREATE DATABASE Team4dbTest;

USE Team4dbTest;

CREATE TABLE userprofile (
	id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(50) UNIQUE,
	email VARCHAR (100) UNIQUE,
	password_hash VARCHAR (255),
	firstname VARCHAR (50),
	lastname VARCHAR (50),
	salthash VARBINARY(128),
	publickey VARCHAR(500)
);

CREATE TABLE videos (
    videoName VARCHAR(100) PRIMARY KEY,
    subDate DATETIME,
    retDate DATETIME,
    senderID INT,
    senderFName VARCHAR(50),
    senderLName VARCHAR(50),
    receiverID INT,
    encrpyt VARCHAR(500),
    FOREIGN KEY (receiverID) REFERENCES userprofile(id) ON DELETE CASCADE
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
	chatLogID INT PRIMARY KEY,
	timestamp DATETIME,
	senderID int,
	receiverID int,
	encrpyt VARCHAR(500),
	retDate DATETIME,
	FOREIGN KEY (senderID) REFERENCES userprofile(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverID) REFERENCES userprofile(id) ON DELETE CASCADE
);