DROP DATABASE IF EXISTS Team4db;

CREATE DATABASE Team4db;

USE Team4db;

CREATE TABLE userprofile (
	id int AUTO_INCREMENT PRIMARY KEY,
	username Varchar(50) UNIQUE,
	email VARCHAR (100) UNIQUE,
	passsword_hash VARCHAR (255),
	firstname VARCHAR (50),
	lastname Varchar (50)
);
