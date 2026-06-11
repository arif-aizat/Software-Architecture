-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: recruitment_db
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- CREATE AND CHOOSE THE TARGET DATABASE HERE
CREATE DATABASE IF NOT EXISTS `recruitment_db`;
USE `recruitment_db`;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  `status` enum('submitted','screening','shortlisted','interview','rejected','hired') DEFAULT 'submitted',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,3,4,'interview','2026-06-10 11:34:51'),(2,2,4,'rejected','2026-06-10 11:53:46'),(3,1,1,'interview','2026-06-10 12:10:08'),(4,2,1,'screening','2026-06-10 12:14:47');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  `job_title` varchar(150) DEFAULT NULL,
  `interview_date` date NOT NULL,
  `interview_time` time NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`),
  CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviews`
--

LOCK TABLES `interviews` WRITE;
/*!40000 ALTER TABLE `interviews` DISABLE KEYS */;
INSERT INTO `interviews` VALUES (1,1,4,'Desktop Engineer','2026-06-10','10:15:00','Webex','The Interview Link will be send to your email.','2026-06-10 11:37:01'),(2,3,1,'Software Engineering','2026-06-30','14:30:00','Axiata Arena','Full Details Will Be Send To Your Email','2026-06-10 12:12:47');
/*!40000 ALTER TABLE `interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text,
  `company` varchar(100) DEFAULT NULL,
  `location` varchar(150) DEFAULT 'Malaysia',
  `job_type` enum('full-time','part-time','contract','internship') DEFAULT 'full-time',
  `status` enum('open','closed') DEFAULT 'open',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,'Software Engineering','Urgent!!','Hartalega','Shah Alam','full-time','open',2,'2026-06-10 11:32:23'),(2,'Software Tester','Looking for a Software Tester for our Team','Starteq','Johor Bahru','full-time','open',2,'2026-06-10 11:33:22'),(3,'Desktop Engineer','Desktop Engineer as a Part Time','Top Glove','Pulau Pinang','part-time','open',2,'2026-06-10 11:34:30');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,'Your application for \"Desktop Engineer\" at Top Glove has been received! We will review it shortly.',0,'2026-06-10 11:34:51'),(2,4,'Your application for \"Desktop Engineer\" at Top Glove has been updated to: INTERVIEW',0,'2026-06-10 11:35:45'),(3,4,'Interview scheduled for \"Desktop Engineer\" on 2026-06-10 at 10:15. Location: Webex',0,'2026-06-10 11:37:01'),(4,4,'Your application for \"Software Tester\" at Starteq has been received! We will review it shortly.',0,'2026-06-10 11:53:46'),(5,4,'Your application for \"Software Tester\" at Starteq has been updated to: REJECTED',0,'2026-06-10 11:54:37'),(6,1,'Your application for \"Software Engineering\" at Hartalega has been received! We will review it shortly.',0,'2026-06-10 12:10:08'),(7,1,'Your application for \"Software Engineering\" at Hartalega has been updated to: SHORTLISTED',0,'2026-06-10 12:11:40'),(8,1,'Interview scheduled for \"Software Engineering\" on 2026-06-30 at 14:30. Location: Axiata Arena',0,'2026-06-10 12:12:47'),(9,1,'Your application for \"Software Tester\" at Starteq has been received! We will review it shortly.',0,'2026-06-10 12:14:47'),(10,1,'Your application for \"Software Tester\" at Starteq has been updated to: SCREENING',0,'2026-06-10 12:17:25');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('candidate','recruiter') DEFAULT 'candidate',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Aizat','aizat@gmail.com','','candidate','2026-06-10 11:30:05'),(2,'Jeevanraj Varma','jeevan@gmail.com','123456','recruiter','2026-06-10 11:30:23'),(4,'Merrul','merrul@gmail.com','123456','candidate','2026-06-10 11:30:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 20:33:20