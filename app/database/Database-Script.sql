DROP DATABASE IF EXISTS Team4db;

CREATE DATABASE Team4db;

USE Team4db;

CREATE TABLE userprofile (
    id int AUTO_INCREMENT PRIMARY KEY,
    username Varchar(50) UNIQUE,
    email VARCHAR (100) UNIQUE,
    password_hash VARCHAR (255),
    firstname VARCHAR (50),
    lastname Varchar (50)
);

CREATE TABLE videos (
    videoID INT AUTO_INCREMENT PRIMARY KEY,
    subDate DATETIME,
    retDate DATETIME,
    senderID INT,
    senderFName VARCHAR(50),
    senderLName VARCHAR(50),
    recieverID INT,
    FOREIGN KEY (senderID) REFERENCES userprofile(id) ON DELETE CASCADE,
    FOREIGN KEY (recieverID) REFERENCES userprofile(id) ON DELETE CASCADE
);

