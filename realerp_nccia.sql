-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 06, 2026 at 04:04 PM
-- Server version: 8.0.43-cll-lve
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `realerp_nccia`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint UNSIGNED NOT NULL,
  `log_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint UNSIGNED DEFAULT NULL,
  `causer_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `causer_id` bigint UNSIGNED DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `batch_uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(1, 'default', 'created', 'App\\Models\\Complaint', 'created', 1, NULL, NULL, '{\"attributes\": {\"id\": 1, \"cmu\": \"CCRC - LHR\", \"cnic\": \"76545-7106589-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"959, Gulberg, Lahore\", \"user_id\": \"9\", \"diary_no\": \"LHR-D-6369/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"030-5940037\", \"created_at\": \"2026-05-10T10:48:19.000000Z\", \"entry_time\": \"2026-07-09T14:56:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Ahmad Hassan. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-12\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Bank\", \"amount_involved\": \"1922944.00\", \"occurrence_date\": \"2026-07-14\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Ahmad Hassan\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(2, 'default', 'created', 'App\\Models\\Complaint', 'created', 2, NULL, NULL, '{\"attributes\": {\"id\": 2, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"14157-6680243-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"748, Model Town, Karachi\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-4647/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"034-4056578\", \"created_at\": \"2026-06-13T10:48:19.000000Z\", \"entry_time\": \"2026-07-09T12:49:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Muhammad Ali. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-31\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"PM Office\", \"amount_involved\": \"1894828.00\", \"occurrence_date\": \"2026-07-07\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Muhammad Ali\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(3, 'default', 'created', 'App\\Models\\Complaint', 'created', 3, NULL, NULL, '{\"attributes\": {\"id\": 3, \"cmu\": \"CCRC - ISB\", \"cnic\": \"14567-7638525-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"984, Gulberg, Quetta\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-4542/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"034-9520760\", \"created_at\": \"2026-05-07T10:48:19.000000Z\", \"entry_time\": \"2026-07-03T11:00:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Fatima Zahra. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-04-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"PM Office\", \"amount_involved\": \"4183945.00\", \"occurrence_date\": \"2026-03-24\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Fatima Zahra\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(4, 'default', 'created', 'App\\Models\\Complaint', 'created', 4, NULL, NULL, '{\"attributes\": {\"id\": 4, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"57104-1339038-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"713, Garden Town, Lahore\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-5429/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"031-4352642\", \"created_at\": \"2026-06-04T10:48:19.000000Z\", \"entry_time\": \"2026-07-11T12:44:00.000000Z\", \"profession\": \"Teacher\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Omar Farooq. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-05-07\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"General Public\", \"amount_involved\": \"4564469.00\", \"occurrence_date\": \"2026-02-08\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Omar Farooq\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(5, 'default', 'created', 'App\\Models\\Complaint', 'created', 5, NULL, NULL, '{\"attributes\": {\"id\": 5, \"cmu\": \"CCRC - ISB\", \"cnic\": \"39686-9109630-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"308, Model Town, Quetta\", \"user_id\": \"9\", \"diary_no\": \"LHR-D-9664/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"035-4280723\", \"created_at\": \"2026-06-11T10:48:19.000000Z\", \"entry_time\": \"2026-07-02T13:15:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Ayesha Bibi. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-05-11\", \"tracking_no\": \"KHI-C-0005/26\", \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Organization\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-06\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Ayesha Bibi\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(6, 'default', 'created', 'App\\Models\\Complaint', 'created', 6, NULL, NULL, '{\"attributes\": {\"id\": 6, \"cmu\": \"CCRC - KHI\", \"cnic\": \"99053-4159529-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"157, Garden Town, Quetta\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-4591/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"038-1142080\", \"created_at\": \"2026-05-11T10:48:19.000000Z\", \"entry_time\": \"2026-06-30T16:58:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Bilal Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-06-23\", \"tracking_no\": \"ISB-C-0006/26\", \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": \"2767508.00\", \"occurrence_date\": \"2026-07-12\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Bilal Ahmed\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(7, 'default', 'created', 'App\\Models\\Complaint', 'created', 7, NULL, NULL, '{\"attributes\": {\"id\": 7, \"cmu\": \"CCRC - KHI\", \"cnic\": \"18050-4105147-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"665, Defence, Lahore\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-5619/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"034-4615136\", \"created_at\": \"2026-05-18T10:48:19.000000Z\", \"entry_time\": \"2026-07-12T14:58:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Sana Tariq. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-04-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Ministry\", \"amount_involved\": null, \"occurrence_date\": \"2026-06-25\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Sana Tariq\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(8, 'default', 'created', 'App\\Models\\Complaint', 'created', 8, NULL, NULL, '{\"attributes\": {\"id\": 8, \"cmu\": \"CCRC - KHI\", \"cnic\": \"54843-3948213-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"238, Defence, Karachi\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-6604/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"030-3873123\", \"created_at\": \"2026-07-03T10:48:19.000000Z\", \"entry_time\": \"2026-07-13T13:49:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Kamran Iqbal. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-06-30\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": \"3451192.00\", \"occurrence_date\": \"2026-04-17\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Kamran Iqbal\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(9, 'default', 'created', 'App\\Models\\Complaint', 'created', 9, NULL, NULL, '{\"attributes\": {\"id\": 9, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"45966-3888142-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"215, Garden Town, Islamabad\", \"user_id\": \"3\", \"diary_no\": \"LHR-D-9076/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"039-9892216\", \"created_at\": \"2026-06-23T10:48:19.000000Z\", \"entry_time\": \"2026-07-16T12:31:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Zainab Noor. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-06-27\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Ministry\", \"amount_involved\": \"2428517.00\", \"occurrence_date\": \"2026-05-23\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Zainab Noor\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(10, 'default', 'created', 'App\\Models\\Complaint', 'created', 10, NULL, NULL, '{\"attributes\": {\"id\": 10, \"cmu\": \"CCRC - LHR\", \"cnic\": \"81125-7933956-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"513, Defence, Islamabad\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-0274/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"037-8022796\", \"created_at\": \"2026-05-26T10:48:19.000000Z\", \"entry_time\": \"2026-06-23T12:14:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Tariq Mahmood. Further investigation required to ascertain the facts.\", \"operator_id\": \"8\", \"report_date\": \"2026-04-27\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Court\", \"amount_involved\": \"1950334.00\", \"occurrence_date\": \"2026-06-26\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Tariq Mahmood\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(11, 'default', 'created', 'App\\Models\\Complaint', 'created', 11, NULL, NULL, '{\"attributes\": {\"id\": 11, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"27284-9843001-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"164, Defence, Quetta\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-2190/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"031-3376890\", \"created_at\": \"2026-05-22T10:48:19.000000Z\", \"entry_time\": \"2026-07-13T09:56:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Nadia Hussain. Further investigation required to ascertain the facts.\", \"operator_id\": \"3\", \"report_date\": \"2026-06-12\", \"tracking_no\": \"UET-C-0011/26\", \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"PM Office\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-24\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Nadia Hussain\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(12, 'default', 'created', 'App\\Models\\Complaint', 'created', 12, NULL, NULL, '{\"attributes\": {\"id\": 12, \"cmu\": \"CCRC - LHR\", \"cnic\": \"57497-7615527-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"547, Model Town, Islamabad\", \"user_id\": \"3\", \"diary_no\": \"LHR-D-6797/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"030-9190876\", \"created_at\": \"2026-07-15T10:48:19.000000Z\", \"entry_time\": \"2026-07-09T11:34:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Imran Khan. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-06-10\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Bank\", \"amount_involved\": null, \"occurrence_date\": \"2026-05-10\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Imran Khan\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(13, 'default', 'created', 'App\\Models\\Complaint', 'created', 13, NULL, NULL, '{\"attributes\": {\"id\": 13, \"cmu\": \"CCRC - LHR\", \"cnic\": \"76958-5516017-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"235, Garden Town, Islamabad\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-6383/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"033-1672206\", \"created_at\": \"2026-05-18T10:48:19.000000Z\", \"entry_time\": \"2026-06-29T10:19:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Sadia Bhatti. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-06-01\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Organization\", \"amount_involved\": \"264467.00\", \"occurrence_date\": \"2026-04-28\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Sadia Bhatti\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(14, 'default', 'created', 'App\\Models\\Complaint', 'created', 14, NULL, NULL, '{\"attributes\": {\"id\": 14, \"cmu\": \"CCRC - LHR\", \"cnic\": \"86068-2009690-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"858, Gulberg, Quetta\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-6401/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"033-5580827\", \"created_at\": \"2026-07-10T10:48:19.000000Z\", \"entry_time\": \"2026-07-15T09:31:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Faisal Rafiq. Further investigation required to ascertain the facts.\", \"operator_id\": \"8\", \"report_date\": \"2026-07-13\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Organization\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-12\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Faisal Rafiq\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(15, 'default', 'created', 'App\\Models\\Complaint', 'created', 15, NULL, NULL, '{\"attributes\": {\"id\": 15, \"cmu\": \"CCRC - KHI\", \"cnic\": \"97154-4400244-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"152, Defence, Karachi\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-4987/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"034-7781840\", \"created_at\": \"2026-05-01T10:48:19.000000Z\", \"entry_time\": \"2026-06-28T16:49:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Rabia Anjum. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-05-17\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Anonymous\", \"amount_involved\": \"2244167.00\", \"occurrence_date\": \"2026-05-28\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Rabia Anjum\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(16, 'default', 'created', 'App\\Models\\Complaint', 'created', 16, NULL, NULL, '{\"attributes\": {\"id\": 16, \"cmu\": \"CCRC - LHR\", \"cnic\": \"91042-4046911-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"888, Gulberg, Islamabad\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-4875/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"030-8765567\", \"created_at\": \"2026-07-05T10:48:19.000000Z\", \"entry_time\": \"2026-07-14T11:43:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Usman Ghani. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-07-15\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Organization\", \"amount_involved\": \"173180.00\", \"occurrence_date\": \"2026-02-04\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Usman Ghani\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(17, 'default', 'created', 'App\\Models\\Complaint', 'created', 17, NULL, NULL, '{\"attributes\": {\"id\": 17, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"83075-4264646-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"584, Gulberg, Peshawar\", \"user_id\": \"9\", \"diary_no\": \"LHR-D-6320/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"033-2822996\", \"created_at\": \"2026-07-05T10:48:19.000000Z\", \"entry_time\": \"2026-07-03T12:53:00.000000Z\", \"profession\": \"Teacher\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Hina Tariq. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-06-13\", \"tracking_no\": \"KHI-C-0017/26\", \"final_status\": null, \"offence_type\": \"crypto_fraud\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Bank\", \"amount_involved\": \"908924.00\", \"occurrence_date\": \"2026-02-02\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Hina Tariq\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(18, 'default', 'created', 'App\\Models\\Complaint', 'created', 18, NULL, NULL, '{\"attributes\": {\"id\": 18, \"cmu\": \"CCRC - LHR\", \"cnic\": \"96796-8706834-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"299, Main Blvd, Karachi\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-0811/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"030-9787630\", \"created_at\": \"2026-04-22T10:48:19.000000Z\", \"entry_time\": \"2026-07-10T13:17:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Javed Ashraf. Further investigation required to ascertain the facts.\", \"operator_id\": \"9\", \"report_date\": \"2026-06-19\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Anonymous\", \"amount_involved\": \"3176873.00\", \"occurrence_date\": \"2026-03-06\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Javed Ashraf\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(19, 'default', 'created', 'App\\Models\\Complaint', 'created', 19, NULL, NULL, '{\"attributes\": {\"id\": 19, \"cmu\": \"CCRC - KHI\", \"cnic\": \"56849-9176471-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"954, Model Town, Karachi\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-2448/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"037-7235704\", \"created_at\": \"2026-05-04T10:48:19.000000Z\", \"entry_time\": \"2026-07-12T09:13:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Saima Akram. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-05-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": \"941906.00\", \"occurrence_date\": \"2026-01-24\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Saima Akram\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(20, 'default', 'created', 'App\\Models\\Complaint', 'created', 20, NULL, NULL, '{\"attributes\": {\"id\": 20, \"cmu\": \"CCRC - ISB\", \"cnic\": \"41808-4682257-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"649, Model Town, Quetta\", \"user_id\": \"3\", \"diary_no\": \"LHR-D-8703/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"039-7121642\", \"created_at\": \"2026-04-18T10:48:19.000000Z\", \"entry_time\": \"2026-06-26T12:04:00.000000Z\", \"profession\": \"Teacher\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Khalid Mehmood. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-05-15\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"PM Office\", \"amount_involved\": \"1581101.00\", \"occurrence_date\": \"2026-05-18\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Khalid Mehmood\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(21, 'default', 'created', 'App\\Models\\Complaint', 'created', 21, NULL, NULL, '{\"attributes\": {\"id\": 21, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"97651-6686424-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"520, Main Blvd, Quetta\", \"user_id\": \"9\", \"diary_no\": \"LHR-D-1130/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"034-1729653\", \"created_at\": \"2026-07-11T10:48:19.000000Z\", \"entry_time\": \"2026-06-19T16:22:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Amna Saeed. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-07-16\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Organization\", \"amount_involved\": \"4840164.00\", \"occurrence_date\": \"2026-06-02\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Amna Saeed\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(22, 'default', 'created', 'App\\Models\\Complaint', 'created', 22, NULL, NULL, '{\"attributes\": {\"id\": 22, \"cmu\": \"CCRC - LHR\", \"cnic\": \"43757-1896804-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"511, Garden Town, Lahore\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-3472/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"033-2977475\", \"created_at\": \"2026-05-19T10:48:19.000000Z\", \"entry_time\": \"2026-07-08T17:06:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Naveed Ahmad. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-06-25\", \"tracking_no\": \"ISB-C-0022/26\", \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Ministry\", \"amount_involved\": \"1759107.00\", \"occurrence_date\": \"2026-01-28\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Naveed Ahmad\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(23, 'default', 'created', 'App\\Models\\Complaint', 'created', 23, NULL, NULL, '{\"attributes\": {\"id\": 23, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"32721-6658695-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"584, Garden Town, Peshawar\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-4731/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"035-5670408\", \"created_at\": \"2026-05-17T10:48:19.000000Z\", \"entry_time\": \"2026-07-09T13:51:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Rubina Shaheen. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-05-11\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"General Public\", \"amount_involved\": \"25516.00\", \"occurrence_date\": \"2026-05-20\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Rubina Shaheen\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(24, 'default', 'created', 'App\\Models\\Complaint', 'created', 24, NULL, NULL, '{\"attributes\": {\"id\": 24, \"cmu\": \"CCRC - LHR\", \"cnic\": \"26794-3964272-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"984, Model Town, Lahore\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-4397/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"031-5333925\", \"created_at\": \"2026-06-17T10:48:19.000000Z\", \"entry_time\": \"2026-07-09T12:43:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Asif Raza. Further investigation required to ascertain the facts.\", \"operator_id\": \"12\", \"report_date\": \"2026-05-26\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Organization\", \"amount_involved\": \"1951029.00\", \"occurrence_date\": \"2026-06-06\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Asif Raza\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(25, 'default', 'created', 'App\\Models\\Complaint', 'created', 25, NULL, NULL, '{\"attributes\": {\"id\": 25, \"cmu\": \"CCRC - LHR\", \"cnic\": \"80662-7723371-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"344, Garden Town, Islamabad\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-9814/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"038-5573140\", \"created_at\": \"2026-04-21T10:48:19.000000Z\", \"entry_time\": \"2026-06-17T14:06:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Tahira Bibi. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-31\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Bank\", \"amount_involved\": \"3506285.00\", \"occurrence_date\": \"2026-01-28\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Tahira Bibi\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(26, 'default', 'created', 'App\\Models\\Complaint', 'created', 26, NULL, NULL, '{\"attributes\": {\"id\": 26, \"cmu\": \"CCRC - KHI\", \"cnic\": \"18052-5523837-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"383, Model Town, Peshawar\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-4720/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"034-8284852\", \"created_at\": \"2026-07-06T10:48:19.000000Z\", \"entry_time\": \"2026-07-14T13:06:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Shahid Ali. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-05-14\", \"tracking_no\": \"ISB-C-0026/26\", \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"General Public\", \"amount_involved\": \"4383142.00\", \"occurrence_date\": \"2026-05-17\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Shahid Ali\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(27, 'default', 'created', 'App\\Models\\Complaint', 'created', 27, NULL, NULL, '{\"attributes\": {\"id\": 27, \"cmu\": \"CCRC - LHR\", \"cnic\": \"46695-6561160-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"598, Gulberg, Karachi\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-2780/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"037-2737087\", \"created_at\": \"2026-06-09T10:48:19.000000Z\", \"entry_time\": \"2026-07-11T10:11:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Nargis Fatima. Further investigation required to ascertain the facts.\", \"operator_id\": \"3\", \"report_date\": \"2026-07-12\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Court\", \"amount_involved\": \"2259541.00\", \"occurrence_date\": \"2026-07-10\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Nargis Fatima\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(28, 'default', 'created', 'App\\Models\\Complaint', 'created', 28, NULL, NULL, '{\"attributes\": {\"id\": 28, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"92820-7682520-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"225, Main Blvd, Islamabad\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-4404/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"038-5396971\", \"created_at\": \"2026-06-11T10:48:19.000000Z\", \"entry_time\": \"2026-06-30T15:15:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Irfan Ullah. Further investigation required to ascertain the facts.\", \"operator_id\": \"8\", \"report_date\": \"2026-06-12\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": null, \"occurrence_date\": \"2026-02-28\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Irfan Ullah\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(29, 'default', 'created', 'App\\Models\\Complaint', 'created', 29, NULL, NULL, '{\"attributes\": {\"id\": 29, \"cmu\": \"CCRC - KHI\", \"cnic\": \"25953-8971148-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"95, Main Blvd, Lahore\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-9178/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"031-2227463\", \"created_at\": \"2026-04-25T10:48:19.000000Z\", \"entry_time\": \"2026-07-02T11:04:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Kiran Masood. Further investigation required to ascertain the facts.\", \"operator_id\": \"3\", \"report_date\": \"2026-05-15\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Anonymous\", \"amount_involved\": \"4018527.00\", \"occurrence_date\": \"2026-03-29\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Kiran Masood\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(30, 'default', 'created', 'App\\Models\\Complaint', 'created', 30, NULL, NULL, '{\"attributes\": {\"id\": 30, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"75914-3859033-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"775, Model Town, Quetta\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-3322/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"034-5217546\", \"created_at\": \"2026-04-19T10:48:19.000000Z\", \"entry_time\": \"2026-07-11T17:48:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Rashid Minhas. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-06-12\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Court\", \"amount_involved\": \"1947231.00\", \"occurrence_date\": \"2026-05-29\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Rashid Minhas\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(31, 'default', 'created', 'App\\Models\\Complaint', 'created', 31, NULL, NULL, '{\"attributes\": {\"id\": 31, \"cmu\": \"CCRC - KHI\", \"cnic\": \"64147-1960375-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"54, Gulberg, Islamabad\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-9517/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"039-7005050\", \"created_at\": \"2026-05-19T10:48:19.000000Z\", \"entry_time\": \"2026-06-26T12:20:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Samina Yasmin. Further investigation required to ascertain the facts.\", \"operator_id\": \"7\", \"report_date\": \"2026-07-07\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": \"159381.00\", \"occurrence_date\": \"2026-05-21\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Samina Yasmin\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(32, 'default', 'created', 'App\\Models\\Complaint', 'created', 32, NULL, NULL, '{\"attributes\": {\"id\": 32, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"33283-7059844-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"184, Model Town, Lahore\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-9321/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"030-9526563\", \"created_at\": \"2026-05-25T10:48:19.000000Z\", \"entry_time\": \"2026-07-05T16:52:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Farhan Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Court\", \"amount_involved\": \"2507119.00\", \"occurrence_date\": \"2026-03-28\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Farhan Akhtar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(33, 'default', 'created', 'App\\Models\\Complaint', 'created', 33, NULL, NULL, '{\"attributes\": {\"id\": 33, \"cmu\": \"CCRC - LHR\", \"cnic\": \"30007-9952748-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"357, Garden Town, Peshawar\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-4518/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"031-1922323\", \"created_at\": \"2026-04-24T10:48:19.000000Z\", \"entry_time\": \"2026-07-13T13:56:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Nasreen Javed. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-05-05\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Ministry\", \"amount_involved\": \"4434353.00\", \"occurrence_date\": \"2026-02-06\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Nasreen Javed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(34, 'default', 'created', 'App\\Models\\Complaint', 'created', 34, NULL, NULL, '{\"attributes\": {\"id\": 34, \"cmu\": \"CCRC - KHI\", \"cnic\": \"45668-1382910-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"410, Garden Town, Islamabad\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-2085/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"032-4914427\", \"created_at\": \"2026-06-09T10:48:19.000000Z\", \"entry_time\": \"2026-06-27T10:07:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Waqar Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-07-09\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"crypto_fraud\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Organization\", \"amount_involved\": \"375308.00\", \"occurrence_date\": \"2026-06-06\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Waqar Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(35, 'default', 'created', 'App\\Models\\Complaint', 'created', 35, NULL, NULL, '{\"attributes\": {\"id\": 35, \"cmu\": \"CCRC - LHR\", \"cnic\": \"54934-7333369-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"365, Garden Town, Peshawar\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-1286/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"032-5112200\", \"created_at\": \"2026-07-13T10:48:19.000000Z\", \"entry_time\": \"2026-06-26T11:14:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Shabnam Kiran. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-06-24\", \"tracking_no\": \"KHI-C-0035/26\", \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": \"445675.00\", \"occurrence_date\": \"2026-05-24\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Shabnam Kiran\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(36, 'default', 'created', 'App\\Models\\Complaint', 'created', 36, NULL, NULL, '{\"attributes\": {\"id\": 36, \"cmu\": \"CCRC - ISB\", \"cnic\": \"40929-3394213-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"383, Main Blvd, Quetta\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-1806/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"035-9229036\", \"created_at\": \"2026-05-26T10:48:19.000000Z\", \"entry_time\": \"2026-06-21T13:40:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Adnan Rashid. Further investigation required to ascertain the facts.\", \"operator_id\": \"9\", \"report_date\": \"2026-06-15\", \"tracking_no\": \"UET-C-0036/26\", \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"PM Office\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-22\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Adnan Rashid\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(37, 'default', 'created', 'App\\Models\\Complaint', 'created', 37, NULL, NULL, '{\"attributes\": {\"id\": 37, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"68166-2125689-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"77, Model Town, Quetta\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-0453/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"031-6916761\", \"created_at\": \"2026-05-23T10:48:19.000000Z\", \"entry_time\": \"2026-06-30T09:10:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Shazia Zafar. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-05-04\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Anonymous\", \"amount_involved\": \"2193276.00\", \"occurrence_date\": \"2026-01-19\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Shazia Zafar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(38, 'default', 'created', 'App\\Models\\Complaint', 'created', 38, NULL, NULL, '{\"attributes\": {\"id\": 38, \"cmu\": \"CCRC - KHI\", \"cnic\": \"45951-6109594-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"191, Model Town, Karachi\", \"user_id\": \"3\", \"diary_no\": \"LHR-D-3087/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"038-8330192\", \"created_at\": \"2026-06-25T10:48:19.000000Z\", \"entry_time\": \"2026-06-28T16:37:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Junaid Iqbal. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-04-19\", \"tracking_no\": \"UET-C-0038/26\", \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": \"3469370.00\", \"occurrence_date\": \"2026-06-06\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Junaid Iqbal\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(39, 'default', 'created', 'App\\Models\\Complaint', 'created', 39, NULL, NULL, '{\"attributes\": {\"id\": 39, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"33321-8625548-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"333, Garden Town, Karachi\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-1265/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"031-5995931\", \"created_at\": \"2026-06-17T10:48:19.000000Z\", \"entry_time\": \"2026-07-02T17:21:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Najma Sultana. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-06-18\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Court\", \"amount_involved\": \"200567.00\", \"occurrence_date\": \"2026-05-10\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Najma Sultana\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(40, 'default', 'created', 'App\\Models\\Complaint', 'created', 40, NULL, NULL, '{\"attributes\": {\"id\": 40, \"cmu\": \"CCRC - KHI\", \"cnic\": \"84865-8655024-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"393, Gulberg, Islamabad\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-8801/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"038-7985498\", \"created_at\": \"2026-05-13T10:48:19.000000Z\", \"entry_time\": \"2026-07-06T11:28:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Sohail Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-04-27\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": \"4366036.00\", \"occurrence_date\": \"2026-05-09\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Sohail Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:19', '2026-07-17 05:48:19'),
(41, 'default', 'created', 'App\\Models\\Complaint', 'created', 41, NULL, NULL, '{\"attributes\": {\"id\": 41, \"cmu\": \"CCRC - KHI\", \"cnic\": \"49780-7347271-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"432, Model Town, Karachi\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-7840/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"033-6267599\", \"created_at\": \"2026-05-22T10:48:19.000000Z\", \"entry_time\": \"2026-06-22T10:45:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Parveen Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-05-06\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Ministry\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-11\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Parveen Akhtar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(42, 'default', 'created', 'App\\Models\\Complaint', 'created', 42, NULL, NULL, '{\"attributes\": {\"id\": 42, \"cmu\": \"CCRC - KHI\", \"cnic\": \"58202-8285298-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"13, Garden Town, Islamabad\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-6432/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"037-7561321\", \"created_at\": \"2026-06-30T10:48:20.000000Z\", \"entry_time\": \"2026-07-15T14:03:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Tanveer Hussain. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-09\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"PM Office\", \"amount_involved\": \"1865828.00\", \"occurrence_date\": \"2026-05-08\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Tanveer Hussain\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(43, 'default', 'created', 'App\\Models\\Complaint', 'created', 43, NULL, NULL, '{\"attributes\": {\"id\": 43, \"cmu\": \"CCRC - KHI\", \"cnic\": \"50365-1822271-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"34, Main Blvd, Peshawar\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-1128/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"030-4769377\", \"created_at\": \"2026-06-08T10:48:20.000000Z\", \"entry_time\": \"2026-06-19T14:35:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Shamim Bano. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-07-16\", \"tracking_no\": \"LHR-C-0043/26\", \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Ministry\", \"amount_involved\": \"3620992.00\", \"occurrence_date\": \"2026-01-26\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Shamim Bano\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(44, 'default', 'created', 'App\\Models\\Complaint', 'created', 44, NULL, NULL, '{\"attributes\": {\"id\": 44, \"cmu\": \"CCRC - LHR\", \"cnic\": \"92735-9346258-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"931, Model Town, Lahore\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-5837/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"033-2342307\", \"created_at\": \"2026-05-31T10:48:20.000000Z\", \"entry_time\": \"2026-07-06T14:09:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Kashif Ali. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-06-09\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-29\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Kashif Ali\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(45, 'default', 'created', 'App\\Models\\Complaint', 'created', 45, NULL, NULL, '{\"attributes\": {\"id\": 45, \"cmu\": \"CCRC - ISB\", \"cnic\": \"10053-3087221-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"438, Defence, Karachi\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-4556/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"031-1561959\", \"created_at\": \"2026-07-04T10:48:20.000000Z\", \"entry_time\": \"2026-07-08T13:19:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Nasim Jahan. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-04-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Court\", \"amount_involved\": \"61419.00\", \"occurrence_date\": \"2026-04-05\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Nasim Jahan\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(46, 'default', 'created', 'App\\Models\\Complaint', 'created', 46, NULL, NULL, '{\"attributes\": {\"id\": 46, \"cmu\": \"CCRC - KHI\", \"cnic\": \"33997-4071049-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"269, Main Blvd, Peshawar\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-1334/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"032-3545903\", \"created_at\": \"2026-07-16T10:48:20.000000Z\", \"entry_time\": \"2026-07-07T12:17:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Rizwan Asghar. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-07-08\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"PM Office\", \"amount_involved\": \"442623.00\", \"occurrence_date\": \"2026-05-18\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Rizwan Asghar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(47, 'default', 'created', 'App\\Models\\Complaint', 'created', 47, NULL, NULL, '{\"attributes\": {\"id\": 47, \"cmu\": \"CCRC - ISB\", \"cnic\": \"29876-5875103-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"888, Main Blvd, Peshawar\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-5391/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"037-5076227\", \"created_at\": \"2026-04-20T10:48:20.000000Z\", \"entry_time\": \"2026-07-15T14:26:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Shahnaz Begum. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-04-21\", \"tracking_no\": \"ISB-C-0047/26\", \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Organization\", \"amount_involved\": \"4709257.00\", \"occurrence_date\": \"2026-02-25\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Shahnaz Begum\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(48, 'default', 'created', 'App\\Models\\Complaint', 'created', 48, NULL, NULL, '{\"attributes\": {\"id\": 48, \"cmu\": \"CCRC - ISB\", \"cnic\": \"18656-5578956-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"259, Garden Town, Peshawar\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-1244/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"030-4532398\", \"created_at\": \"2026-04-29T10:48:20.000000Z\", \"entry_time\": \"2026-06-21T10:59:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Mudassar Ali. Further investigation required to ascertain the facts.\", \"operator_id\": \"3\", \"report_date\": \"2026-05-04\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Bank\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-09\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Mudassar Ali\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(49, 'default', 'created', 'App\\Models\\Complaint', 'created', 49, NULL, NULL, '{\"attributes\": {\"id\": 49, \"cmu\": \"CCRC - ISB\", \"cnic\": \"15296-6105268-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"374, Defence, Islamabad\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-2048/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"031-7125425\", \"created_at\": \"2026-07-04T10:48:20.000000Z\", \"entry_time\": \"2026-06-17T13:31:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Zubaida Khatoon. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-07-08\", \"tracking_no\": \"UET-C-0049/26\", \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Anonymous\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-13\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Zubaida Khatoon\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(50, 'default', 'created', 'App\\Models\\Complaint', 'created', 50, NULL, NULL, '{\"attributes\": {\"id\": 50, \"cmu\": \"CCRC - ISB\", \"cnic\": \"13328-8501606-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"443, Garden Town, Quetta\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-2620/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"039-3980583\", \"created_at\": \"2026-06-19T10:48:20.000000Z\", \"entry_time\": \"2026-07-05T15:06:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Naeem Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"12\", \"report_date\": \"2026-06-24\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Court\", \"amount_involved\": null, \"occurrence_date\": \"2026-06-09\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Naeem Akhtar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(51, 'default', 'created', 'App\\Models\\Complaint', 'created', 51, NULL, NULL, '{\"attributes\": {\"id\": 51, \"cmu\": \"CCRC - KHI\", \"cnic\": \"67831-8755220-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"802, Model Town, Islamabad\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-4490/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"034-8979455\", \"created_at\": \"2026-05-19T10:48:20.000000Z\", \"entry_time\": \"2026-07-01T16:15:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Ashraf Hussain. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-06-27\", \"tracking_no\": \"LHR-C-0051/26\", \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"General Public\", \"amount_involved\": \"3192710.00\", \"occurrence_date\": \"2026-03-06\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Ashraf Hussain\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(52, 'default', 'created', 'App\\Models\\Complaint', 'created', 52, NULL, NULL, '{\"attributes\": {\"id\": 52, \"cmu\": \"CCRC - ISB\", \"cnic\": \"92873-6134752-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"442, Gulberg, Lahore\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-6253/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"033-1896913\", \"created_at\": \"2026-06-10T10:48:20.000000Z\", \"entry_time\": \"2026-07-02T09:23:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Shakeel Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"12\", \"report_date\": \"2026-04-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": \"2396281.00\", \"occurrence_date\": \"2026-06-22\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Shakeel Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(53, 'default', 'created', 'App\\Models\\Complaint', 'created', 53, NULL, NULL, '{\"attributes\": {\"id\": 53, \"cmu\": \"CCRC - ISB\", \"cnic\": \"68224-7668730-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"675, Garden Town, Karachi\", \"user_id\": \"3\", \"diary_no\": \"LHR-D-9187/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"038-3510628\", \"created_at\": \"2026-05-01T10:48:20.000000Z\", \"entry_time\": \"2026-07-09T14:23:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Rukhsana Parveen. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-07-11\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Organization\", \"amount_involved\": null, \"occurrence_date\": \"2026-02-04\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Rukhsana Parveen\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(54, 'default', 'created', 'App\\Models\\Complaint', 'created', 54, NULL, NULL, '{\"attributes\": {\"id\": 54, \"cmu\": \"CCRC - ISB\", \"cnic\": \"91488-6834867-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"124, Model Town, Karachi\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-0065/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"032-3114533\", \"created_at\": \"2026-06-20T10:48:20.000000Z\", \"entry_time\": \"2026-06-21T13:56:00.000000Z\", \"profession\": \"Teacher\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Masood Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-05-24\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Ministry\", \"amount_involved\": \"4018548.00\", \"occurrence_date\": \"2026-03-30\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Masood Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(55, 'default', 'created', 'App\\Models\\Complaint', 'created', 55, NULL, NULL, '{\"attributes\": {\"id\": 55, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"75828-6122062-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"709, Model Town, Peshawar\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-0893/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"032-2722973\", \"created_at\": \"2026-05-08T10:48:20.000000Z\", \"entry_time\": \"2026-07-02T15:22:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Zahida Perveen. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-05-23\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": \"3007738.00\", \"occurrence_date\": \"2026-04-10\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Zahida Perveen\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(56, 'default', 'created', 'App\\Models\\Complaint', 'created', 56, NULL, NULL, '{\"attributes\": {\"id\": 56, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"81801-8085358-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"324, Model Town, Islamabad\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-3904/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"037-2539917\", \"created_at\": \"2026-06-15T10:48:20.000000Z\", \"entry_time\": \"2026-06-21T14:04:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Nadeem Asghar. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-22\", \"tracking_no\": \"UET-C-0056/26\", \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Ministry\", \"amount_involved\": \"1664277.00\", \"occurrence_date\": \"2026-02-24\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Nadeem Asghar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(57, 'default', 'created', 'App\\Models\\Complaint', 'created', 57, NULL, NULL, '{\"attributes\": {\"id\": 57, \"cmu\": \"CCRC - LHR\", \"cnic\": \"23015-5030504-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"236, Garden Town, Islamabad\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-3304/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"036-8895295\", \"created_at\": \"2026-06-17T10:48:20.000000Z\", \"entry_time\": \"2026-07-15T16:08:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Shaista Jabeen. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-05-22\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Organization\", \"amount_involved\": null, \"occurrence_date\": \"2026-02-02\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Shaista Jabeen\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(58, 'default', 'created', 'App\\Models\\Complaint', 'created', 58, NULL, NULL, '{\"attributes\": {\"id\": 58, \"cmu\": \"CCRC - ISB\", \"cnic\": \"73917-4890188-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"450, Model Town, Quetta\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-1084/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"035-9997456\", \"created_at\": \"2026-05-22T10:48:20.000000Z\", \"entry_time\": \"2026-07-01T11:56:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Iqbal Hussain. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-04-19\", \"tracking_no\": \"LHR-C-0058/26\", \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Court\", \"amount_involved\": \"524646.00\", \"occurrence_date\": \"2026-02-18\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Iqbal Hussain\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(59, 'default', 'created', 'App\\Models\\Complaint', 'created', 59, NULL, NULL, '{\"attributes\": {\"id\": 59, \"cmu\": \"CCRC - KHI\", \"cnic\": \"94778-4816974-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"106, Defence, Quetta\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-1271/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"037-1329055\", \"created_at\": \"2026-07-07T10:48:20.000000Z\", \"entry_time\": \"2026-07-15T11:08:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Yasmeen Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-06-18\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Ministry\", \"amount_involved\": \"1534331.00\", \"occurrence_date\": \"2026-04-12\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Yasmeen Akhtar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(60, 'default', 'created', 'App\\Models\\Complaint', 'created', 60, NULL, NULL, '{\"attributes\": {\"id\": 60, \"cmu\": \"CCRC - KHI\", \"cnic\": \"93995-4044539-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"869, Defence, Lahore\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-4950/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"037-2981011\", \"created_at\": \"2026-07-02T10:48:20.000000Z\", \"entry_time\": \"2026-06-22T17:45:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Riaz Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-06-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"PM Office\", \"amount_involved\": \"1836014.00\", \"occurrence_date\": \"2026-02-07\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Riaz Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(61, 'default', 'created', 'App\\Models\\Complaint', 'created', 61, NULL, NULL, '{\"attributes\": {\"id\": 61, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"64838-8555755-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"6, Model Town, Quetta\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-3260/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"031-6038107\", \"created_at\": \"2026-07-12T10:48:20.000000Z\", \"entry_time\": \"2026-06-30T11:12:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Musarat Jahan. Further investigation required to ascertain the facts.\", \"operator_id\": \"10\", \"report_date\": \"2026-04-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Bank\", \"amount_involved\": \"220098.00\", \"occurrence_date\": \"2026-04-13\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Musarat Jahan\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(62, 'default', 'created', 'App\\Models\\Complaint', 'created', 62, NULL, NULL, '{\"attributes\": {\"id\": 62, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"67303-6877312-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"333, Model Town, Peshawar\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-0124/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"030-2268665\", \"created_at\": \"2026-07-12T10:48:20.000000Z\", \"entry_time\": \"2026-07-15T13:20:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Sajid Mahmood. Further investigation required to ascertain the facts.\", \"operator_id\": \"9\", \"report_date\": \"2026-07-01\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Court\", \"amount_involved\": \"1560584.00\", \"occurrence_date\": \"2026-01-20\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Sajid Mahmood\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(63, 'default', 'created', 'App\\Models\\Complaint', 'created', 63, NULL, NULL, '{\"attributes\": {\"id\": 63, \"cmu\": \"CCRC - ISB\", \"cnic\": \"55406-2345993-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"845, Defence, Quetta\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-8489/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"030-9532117\", \"created_at\": \"2026-06-10T10:48:20.000000Z\", \"entry_time\": \"2026-06-17T13:54:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Farzana Bibi. Further investigation required to ascertain the facts.\", \"operator_id\": \"3\", \"report_date\": \"2026-06-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Organization\", \"amount_involved\": \"424962.00\", \"occurrence_date\": \"2026-02-05\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Farzana Bibi\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(64, 'default', 'created', 'App\\Models\\Complaint', 'created', 64, NULL, NULL, '{\"attributes\": {\"id\": 64, \"cmu\": \"CCRC - ISB\", \"cnic\": \"30789-1078864-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"255, Gulberg, Quetta\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-4681/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"036-4467615\", \"created_at\": \"2026-05-19T10:48:20.000000Z\", \"entry_time\": \"2026-06-26T12:43:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Arif Hussain. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-06-09\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Ministry\", \"amount_involved\": null, \"occurrence_date\": \"2026-02-05\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Arif Hussain\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(65, 'default', 'created', 'App\\Models\\Complaint', 'created', 65, NULL, NULL, '{\"attributes\": {\"id\": 65, \"cmu\": \"CCRC - ISB\", \"cnic\": \"83026-3082739-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"498, Gulberg, Quetta\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-0466/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"038-8393716\", \"created_at\": \"2026-06-14T10:48:20.000000Z\", \"entry_time\": \"2026-06-24T10:34:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Safina Begum. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-05-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Bank\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-26\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Safina Begum\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(66, 'default', 'created', 'App\\Models\\Complaint', 'created', 66, NULL, NULL, '{\"attributes\": {\"id\": 66, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"58733-8764280-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"231, Gulberg, Lahore\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-2934/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"032-9504086\", \"created_at\": \"2026-05-05T10:48:20.000000Z\", \"entry_time\": \"2026-07-13T13:07:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Zafar Iqbal. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-04-18\", \"tracking_no\": \"LHR-C-0066/26\", \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Organization\", \"amount_involved\": null, \"occurrence_date\": \"2026-04-13\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Zafar Iqbal\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(67, 'default', 'created', 'App\\Models\\Complaint', 'created', 67, NULL, NULL, '{\"attributes\": {\"id\": 67, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"25404-5352766-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"361, Model Town, Quetta\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-3470/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"036-8918231\", \"created_at\": \"2026-06-21T10:48:20.000000Z\", \"entry_time\": \"2026-06-21T14:25:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Samina Parveen. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-07-07\", \"tracking_no\": \"UET-C-0067/26\", \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"PM Office\", \"amount_involved\": \"4356146.00\", \"occurrence_date\": \"2026-04-10\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Samina Parveen\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(68, 'default', 'created', 'App\\Models\\Complaint', 'created', 68, NULL, NULL, '{\"attributes\": {\"id\": 68, \"cmu\": \"CCRC - LHR\", \"cnic\": \"49893-5154530-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"237, Main Blvd, Lahore\", \"user_id\": \"9\", \"diary_no\": \"LHR-D-9699/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"038-1559701\", \"created_at\": \"2026-04-18T10:48:20.000000Z\", \"entry_time\": \"2026-06-27T17:32:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Abdul Majeed. Further investigation required to ascertain the facts.\", \"operator_id\": \"7\", \"report_date\": \"2026-05-22\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Ministry\", \"amount_involved\": \"1832744.00\", \"occurrence_date\": \"2026-07-12\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Abdul Majeed\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(69, 'default', 'created', 'App\\Models\\Complaint', 'created', 69, NULL, NULL, '{\"attributes\": {\"id\": 69, \"cmu\": \"CCRC - KHI\", \"cnic\": \"78703-9197618-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"368, Main Blvd, Karachi\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-2737/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"032-1204397\", \"created_at\": \"2026-04-24T10:48:20.000000Z\", \"entry_time\": \"2026-06-21T12:30:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Noreen Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-07-07\", \"tracking_no\": \"UET-C-0069/26\", \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Court\", \"amount_involved\": null, \"occurrence_date\": \"2026-05-12\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Noreen Akhtar\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(70, 'default', 'created', 'App\\Models\\Complaint', 'created', 70, NULL, NULL, '{\"attributes\": {\"id\": 70, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"19097-4358276-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"531, Model Town, Karachi\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-4823/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"036-5648242\", \"created_at\": \"2026-04-23T10:48:20.000000Z\", \"entry_time\": \"2026-06-30T14:22:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Tariq Javed. Further investigation required to ascertain the facts.\", \"operator_id\": \"9\", \"report_date\": \"2026-05-10\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Postal Service\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"PM Office\", \"amount_involved\": \"2925612.00\", \"occurrence_date\": \"2026-06-25\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Tariq Javed\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(71, 'default', 'created', 'App\\Models\\Complaint', 'created', 71, NULL, NULL, '{\"attributes\": {\"id\": 71, \"cmu\": \"CCRC - KHI\", \"cnic\": \"87111-3399686-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"681, Garden Town, Lahore\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-6169/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"038-2077804\", \"created_at\": \"2026-06-23T10:48:20.000000Z\", \"entry_time\": \"2026-07-08T12:50:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Shabana Kausar. Further investigation required to ascertain the facts.\", \"operator_id\": \"12\", \"report_date\": \"2026-05-10\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Ministry\", \"amount_involved\": \"3067360.00\", \"occurrence_date\": \"2026-03-18\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Shabana Kausar\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(72, 'default', 'created', 'App\\Models\\Complaint', 'created', 72, NULL, NULL, '{\"attributes\": {\"id\": 72, \"cmu\": \"CCRC - ISB\", \"cnic\": \"84897-9391390-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"832, Model Town, Lahore\", \"user_id\": \"4\", \"diary_no\": \"LHR-D-7968/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"030-6592815\", \"created_at\": \"2026-05-20T10:48:20.000000Z\", \"entry_time\": \"2026-06-27T13:17:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Mohsin Ali. Further investigation required to ascertain the facts.\", \"operator_id\": \"12\", \"report_date\": \"2026-04-28\", \"tracking_no\": \"UET-C-0072/26\", \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Court\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-09\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Mohsin Ali\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(73, 'default', 'created', 'App\\Models\\Complaint', 'created', 73, NULL, NULL, '{\"attributes\": {\"id\": 73, \"cmu\": \"CCRC - KHI\", \"cnic\": \"15595-8754201-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"35, Defence, Peshawar\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-2578/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"034-4596205\", \"created_at\": \"2026-05-16T10:48:20.000000Z\", \"entry_time\": \"2026-06-28T11:05:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Nasreen Sultana. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-05-01\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"crypto_fraud\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Ministry\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-02\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Nasreen Sultana\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(74, 'default', 'created', 'App\\Models\\Complaint', 'created', 74, NULL, NULL, '{\"attributes\": {\"id\": 74, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"83890-1592939-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"126, Model Town, Quetta\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-4910/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"035-3620864\", \"created_at\": \"2026-06-21T10:48:20.000000Z\", \"entry_time\": \"2026-07-06T10:36:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Rashid Mahmood. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-04-23\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"General Public\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-12\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Rashid Mahmood\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(75, 'default', 'created', 'App\\Models\\Complaint', 'created', 75, NULL, NULL, '{\"attributes\": {\"id\": 75, \"cmu\": \"CCRC - ISB\", \"cnic\": \"73044-5178066-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"894, Gulberg, Quetta\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-1295/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"038-1259285\", \"created_at\": \"2026-06-02T10:48:20.000000Z\", \"entry_time\": \"2026-06-18T15:41:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Fahmida Bibi. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-05-10\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Anonymous\", \"amount_involved\": \"3365342.00\", \"occurrence_date\": \"2026-04-23\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Fahmida Bibi\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(76, 'default', 'created', 'App\\Models\\Complaint', 'created', 76, NULL, NULL, '{\"attributes\": {\"id\": 76, \"cmu\": \"CCRC - KHI\", \"cnic\": \"84665-6030895-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"706, Main Blvd, Lahore\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-8750/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"032-3341155\", \"created_at\": \"2026-04-22T10:48:20.000000Z\", \"entry_time\": \"2026-06-30T15:37:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Shahid Mahmood. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-07-06\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hate_speech\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Court\", \"amount_involved\": \"3403580.00\", \"occurrence_date\": \"2026-05-29\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Shahid Mahmood\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(77, 'default', 'created', 'App\\Models\\Complaint', 'created', 77, NULL, NULL, '{\"attributes\": {\"id\": 77, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"22885-9854905-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"113, Defence, Lahore\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-1061/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"039-4512303\", \"created_at\": \"2026-05-01T10:48:20.000000Z\", \"entry_time\": \"2026-06-24T15:13:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Ghulam Fatima. Further investigation required to ascertain the facts.\", \"operator_id\": \"7\", \"report_date\": \"2026-06-08\", \"tracking_no\": \"KHI-C-0077/26\", \"final_status\": null, \"offence_type\": \"online_scam\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Court\", \"amount_involved\": \"4310302.00\", \"occurrence_date\": \"2026-06-02\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Ghulam Fatima\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(78, 'default', 'created', 'App\\Models\\Complaint', 'created', 78, NULL, NULL, '{\"attributes\": {\"id\": 78, \"cmu\": \"CCRC - LHR\", \"cnic\": \"97597-1795850-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"855, Defence, Quetta\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-6629/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"037-8540887\", \"created_at\": \"2026-04-27T10:48:20.000000Z\", \"entry_time\": \"2026-06-23T16:38:00.000000Z\", \"profession\": \"Teacher\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Arshad Mehmood. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-05-01\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Organization\", \"amount_involved\": \"2945663.00\", \"occurrence_date\": \"2026-05-16\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Arshad Mehmood\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(79, 'default', 'created', 'App\\Models\\Complaint', 'created', 79, NULL, NULL, '{\"attributes\": {\"id\": 79, \"cmu\": \"CCRC - ISB\", \"cnic\": \"23106-5773628-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"524, Main Blvd, Karachi\", \"user_id\": \"1\", \"diary_no\": \"LHR-D-2807/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"038-8044518\", \"created_at\": \"2026-05-31T10:48:20.000000Z\", \"entry_time\": \"2026-07-13T13:15:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Shamim Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"3\", \"report_date\": \"2026-07-13\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"PM Office\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-27\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Shamim Akhtar\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(80, 'default', 'created', 'App\\Models\\Complaint', 'created', 80, NULL, NULL, '{\"attributes\": {\"id\": 80, \"cmu\": \"CCRC - ISB\", \"cnic\": \"40086-3249449-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"771, Main Blvd, Lahore\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-9696/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"035-4313350\", \"created_at\": \"2026-07-03T10:48:20.000000Z\", \"entry_time\": \"2026-07-02T14:48:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Saleem Raza. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-07-14\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"General Public\", \"amount_involved\": \"3218117.00\", \"occurrence_date\": \"2026-04-20\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Saleem Raza\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(81, 'default', 'created', 'App\\Models\\Complaint', 'created', 81, NULL, NULL, '{\"attributes\": {\"id\": 81, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"20998-5336299-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"192, Model Town, Lahore\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-4725/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"031-6241636\", \"created_at\": \"2026-05-31T10:48:20.000000Z\", \"entry_time\": \"2026-06-23T17:41:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Sajida Parveen. Further investigation required to ascertain the facts.\", \"operator_id\": \"7\", \"report_date\": \"2026-06-05\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Anonymous\", \"amount_involved\": \"3188713.00\", \"occurrence_date\": \"2026-06-14\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Sajida Parveen\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(82, 'default', 'created', 'App\\Models\\Complaint', 'created', 82, NULL, NULL, '{\"attributes\": {\"id\": 82, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"31792-1179910-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"127, Gulberg, Peshawar\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-3741/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"037-4678111\", \"created_at\": \"2026-06-22T10:48:20.000000Z\", \"entry_time\": \"2026-07-11T10:20:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Nisar Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-04-30\", \"tracking_no\": \"UET-C-0082/26\", \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Bank\", \"amount_involved\": \"193737.00\", \"occurrence_date\": \"2026-01-22\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Nisar Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(83, 'default', 'created', 'App\\Models\\Complaint', 'created', 83, NULL, NULL, '{\"attributes\": {\"id\": 83, \"cmu\": \"CCRC - KHI\", \"cnic\": \"39622-8636344-6\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"345, Main Blvd, Peshawar\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-7594/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"030-4297469\", \"created_at\": \"2026-06-16T10:48:20.000000Z\", \"entry_time\": \"2026-06-29T11:28:00.000000Z\", \"profession\": \"Retired\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding defamation — detailed description of the incident involving Shakila Bano. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-06-02\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Bank\", \"amount_involved\": \"3254318.00\", \"occurrence_date\": \"2026-06-29\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Shakila Bano\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(84, 'default', 'created', 'App\\Models\\Complaint', 'created', 84, NULL, NULL, '{\"attributes\": {\"id\": 84, \"cmu\": \"CCRC - LHR\", \"cnic\": \"68762-6682989-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"435, Model Town, Peshawar\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-0883/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"035-1859226\", \"created_at\": \"2026-05-25T10:48:20.000000Z\", \"entry_time\": \"2026-06-25T13:11:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Mazhar Iqbal. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-07-01\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Bank\", \"amount_involved\": \"1633242.00\", \"occurrence_date\": \"2026-02-27\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Mazhar Iqbal\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(85, 'default', 'created', 'App\\Models\\Complaint', 'created', 85, NULL, NULL, '{\"attributes\": {\"id\": 85, \"cmu\": \"CCRC - ISB\", \"cnic\": \"89872-2879874-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"235, Model Town, Peshawar\", \"user_id\": \"9\", \"diary_no\": \"LHR-D-8681/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"037-6005322\", \"created_at\": \"2026-06-07T10:48:20.000000Z\", \"entry_time\": \"2026-07-13T09:26:00.000000Z\", \"profession\": \"Government Employee\", \"updated_at\": \"2026-07-17T10:48:20.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Zareen Taj. Further investigation required to ascertain the facts.\", \"operator_id\": \"8\", \"report_date\": \"2026-06-07\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Organization\", \"amount_involved\": \"3811140.00\", \"occurrence_date\": \"2026-02-15\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Zareen Taj\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:20', '2026-07-17 05:48:20'),
(86, 'default', 'created', 'App\\Models\\Complaint', 'created', 86, NULL, NULL, '{\"attributes\": {\"id\": 86, \"cmu\": \"CCRC - LHR\", \"cnic\": \"18829-7274335-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"239, Garden Town, Lahore\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-8892/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"036-4748249\", \"created_at\": \"2026-05-20T10:48:20.000000Z\", \"entry_time\": \"2026-07-14T10:03:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Khurshid Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"6\", \"report_date\": \"2026-05-29\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-09\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Khurshid Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(87, 'default', 'created', 'App\\Models\\Complaint', 'created', 87, NULL, NULL, '{\"attributes\": {\"id\": 87, \"cmu\": \"CCRC - LHR\", \"cnic\": \"89885-9550624-7\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"745, Garden Town, Peshawar\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-9718/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"033-3943083\", \"created_at\": \"2026-04-29T10:48:21.000000Z\", \"entry_time\": \"2026-06-22T14:18:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Riffat Jahan. Further investigation required to ascertain the facts.\", \"operator_id\": \"8\", \"report_date\": \"2026-05-07\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Organization\", \"amount_involved\": \"4330199.00\", \"occurrence_date\": \"2026-05-14\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Riffat Jahan\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(88, 'default', 'created', 'App\\Models\\Complaint', 'created', 88, NULL, NULL, '{\"attributes\": {\"id\": 88, \"cmu\": \"CCRC - LHR\", \"cnic\": \"86347-9227812-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"120, Garden Town, Lahore\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-0161/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"034-7948234\", \"created_at\": \"2026-04-27T10:48:21.000000Z\", \"entry_time\": \"2026-07-16T14:36:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Ashfaq Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-05-05\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"General Public\", \"amount_involved\": \"3042160.00\", \"occurrence_date\": \"2026-02-27\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Ashfaq Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(89, 'default', 'created', 'App\\Models\\Complaint', 'created', 89, NULL, NULL, '{\"attributes\": {\"id\": 89, \"cmu\": \"CCRC - ISB\", \"cnic\": \"88921-3972045-8\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"811, Main Blvd, Quetta\", \"user_id\": \"5\", \"diary_no\": \"LHR-D-7413/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"033-8907030\", \"created_at\": \"2026-05-25T10:48:21.000000Z\", \"entry_time\": \"2026-07-11T09:46:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding hacking — detailed description of the incident involving Khalida Perveen. Further investigation required to ascertain the facts.\", \"operator_id\": \"12\", \"report_date\": \"2026-07-10\", \"tracking_no\": \"KHI-C-0089/26\", \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Organization\", \"amount_involved\": \"3233195.00\", \"occurrence_date\": \"2026-07-03\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Khalida Perveen\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(90, 'default', 'created', 'App\\Models\\Complaint', 'created', 90, NULL, NULL, '{\"attributes\": {\"id\": 90, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"35898-7739291-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"330, Main Blvd, Lahore\", \"user_id\": \"2\", \"diary_no\": \"LHR-D-5387/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"031-5425887\", \"created_at\": \"2026-04-24T10:48:21.000000Z\", \"entry_time\": \"2026-06-20T09:55:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Shafiq Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"5\", \"report_date\": \"2026-04-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Ministry\", \"amount_involved\": null, \"occurrence_date\": \"2026-02-13\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Shafiq Ahmed\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(91, 'default', 'created', 'App\\Models\\Complaint', 'created', 91, NULL, NULL, '{\"attributes\": {\"id\": 91, \"cmu\": \"CCRC - KHI\", \"cnic\": \"43541-2600526-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"341, Model Town, Islamabad\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-6025/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"035-7887476\", \"created_at\": \"2026-05-13T10:48:21.000000Z\", \"entry_time\": \"2026-06-29T12:46:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding extortion — detailed description of the incident involving Zakia Sultana. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-06-05\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"General Public\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-03\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Zakia Sultana\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(92, 'default', 'created', 'App\\Models\\Complaint', 'created', 92, NULL, NULL, '{\"attributes\": {\"id\": 92, \"cmu\": \"CCRC - ISB\", \"cnic\": \"46639-3491066-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"151, Model Town, Peshawar\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-3288/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"032-8427485\", \"created_at\": \"2026-06-27T10:48:21.000000Z\", \"entry_time\": \"2026-07-08T15:03:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Fida Hussain. Further investigation required to ascertain the facts.\", \"operator_id\": \"11\", \"report_date\": \"2026-05-01\", \"tracking_no\": \"UET-C-0092/26\", \"final_status\": null, \"offence_type\": \"extortion\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"court\", \"received_from\": \"Bank\", \"amount_involved\": \"3519497.00\", \"occurrence_date\": \"2026-02-14\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Fida Hussain\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(93, 'default', 'created', 'App\\Models\\Complaint', 'created', 93, NULL, NULL, '{\"attributes\": {\"id\": 93, \"cmu\": \"CCRC - ISB\", \"cnic\": \"46830-9787236-1\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"486, Model Town, Quetta\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-0787/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"3\", \"contact_no\": \"031-3666765\", \"created_at\": \"2026-05-02T10:48:21.000000Z\", \"entry_time\": \"2026-06-26T09:21:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding online fraud — detailed description of the incident involving Naseem Akhtar. Further investigation required to ascertain the facts.\", \"operator_id\": \"2\", \"report_date\": \"2026-06-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"impersonation\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Anonymous\", \"amount_involved\": null, \"occurrence_date\": \"2026-05-24\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Naseem Akhtar\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(94, 'default', 'created', 'App\\Models\\Complaint', 'created', 94, NULL, NULL, '{\"attributes\": {\"id\": 94, \"cmu\": \"CCRC - ISB\", \"cnic\": \"96175-5077966-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"invalid\", \"address\": \"260, Garden Town, Quetta\", \"user_id\": \"12\", \"diary_no\": \"LHR-D-2845/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"035-1791216\", \"created_at\": \"2026-07-05T10:48:21.000000Z\", \"entry_time\": \"2026-07-03T15:58:00.000000Z\", \"profession\": \"Business Owner\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Anwar Ali. Further investigation required to ascertain the facts.\", \"operator_id\": \"1\", \"report_date\": \"2026-07-04\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"Tipline\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"Bank\", \"amount_involved\": null, \"occurrence_date\": \"2026-06-24\", \"scrutiny_result\": \"invalid\", \"complainant_name\": \"Anwar Ali\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(95, 'default', 'created', 'App\\Models\\Complaint', 'created', 95, NULL, NULL, '{\"attributes\": {\"id\": 95, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"60087-4325679-4\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"169, Gulberg, Islamabad\", \"user_id\": \"10\", \"diary_no\": \"LHR-D-1936/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"033-2895671\", \"created_at\": \"2026-05-03T10:48:21.000000Z\", \"entry_time\": \"2026-06-25T11:55:00.000000Z\", \"profession\": \"Private Sector\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding cyberstalking — detailed description of the incident involving Sughran Bibi. Further investigation required to ascertain the facts.\", \"operator_id\": \"7\", \"report_date\": \"2026-06-20\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"malware\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"General Public\", \"amount_involved\": \"3036398.00\", \"occurrence_date\": \"2026-03-11\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Sughran Bibi\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(96, 'default', 'created', 'App\\Models\\Complaint', 'created', 96, NULL, NULL, '{\"attributes\": {\"id\": 96, \"cmu\": \"CCRC - ISB\", \"cnic\": \"61568-8662964-3\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"irrelevant\", \"address\": \"120, Garden Town, Peshawar\", \"user_id\": \"7\", \"diary_no\": \"LHR-D-2568/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"039-6489646\", \"created_at\": \"2026-04-22T10:48:21.000000Z\", \"entry_time\": \"2026-07-12T10:23:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Shahid Nazir. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-31\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Anonymous\", \"amount_involved\": \"3479691.00\", \"occurrence_date\": \"2026-02-27\", \"scrutiny_result\": \"irrelevant\", \"complainant_name\": \"Shahid Nazir\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(97, 'default', 'created', 'App\\Models\\Complaint', 'created', 97, NULL, NULL, '{\"attributes\": {\"id\": 97, \"cmu\": \"CCRC - ISB\", \"cnic\": \"13571-9801551-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"incomplete\", \"address\": \"332, Model Town, Islamabad\", \"user_id\": \"6\", \"diary_no\": \"LHR-D-9511/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"2\", \"contact_no\": \"032-2389981\", \"created_at\": \"2026-07-15T10:48:21.000000Z\", \"entry_time\": \"2026-07-14T16:22:00.000000Z\", \"profession\": \"Bank Employee\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Hajra Bibi. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-06-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"harassment\", \"received_via\": \"Online Portal\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"anti_state\", \"received_from\": \"Organization\", \"amount_involved\": null, \"occurrence_date\": \"2026-03-20\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"Hajra Bibi\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(98, 'default', 'created', 'App\\Models\\Complaint', 'created', 98, NULL, NULL, '{\"attributes\": {\"id\": 98, \"cmu\": \"CCRC - LHR\", \"cnic\": \"59237-2697462-9\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"999, Defence, Quetta\", \"user_id\": \"8\", \"diary_no\": \"LHR-D-8349/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"1\", \"contact_no\": \"034-5576278\", \"created_at\": \"2026-06-12T10:48:21.000000Z\", \"entry_time\": \"2026-07-15T15:13:00.000000Z\", \"profession\": \"Lawyer\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding bank fraud — detailed description of the incident involving Aslam Pervez. Further investigation required to ascertain the facts.\", \"operator_id\": \"9\", \"report_date\": \"2026-05-17\", \"tracking_no\": \"ISB-C-0098/26\", \"final_status\": null, \"offence_type\": \"crypto_fraud\", \"received_via\": \"Email\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"Organization\", \"amount_involved\": \"4513684.00\", \"occurrence_date\": \"2026-02-19\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Aslam Pervez\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(99, 'default', 'created', 'App\\Models\\Complaint', 'created', 99, NULL, NULL, '{\"attributes\": {\"id\": 99, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"69973-7334854-2\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"80, Defence, Lahore\", \"user_id\": \"3\", \"diary_no\": \"LHR-D-1361/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"038-3493943\", \"created_at\": \"2026-05-18T10:48:21.000000Z\", \"entry_time\": \"2026-07-12T17:47:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding harassment — detailed description of the incident involving Azra Parveen. Further investigation required to ascertain the facts.\", \"operator_id\": \"7\", \"report_date\": \"2026-07-07\", \"tracking_no\": \"UET-C-0099/26\", \"final_status\": null, \"offence_type\": \"hacking\", \"received_via\": \"Walk-in\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"regular\", \"received_from\": \"PM Office\", \"amount_involved\": \"2653155.00\", \"occurrence_date\": \"2026-02-27\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Azra Parveen\", \"operator_remarks\": null, \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(100, 'default', 'created', 'App\\Models\\Complaint', 'created', 100, NULL, NULL, '{\"attributes\": {\"id\": 100, \"cmu\": \"NCCIA - HQs\", \"cnic\": \"33920-1058573-5\", \"laws\": [\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"], \"source\": null, \"status\": \"complete\", \"address\": \"361, Defence, Lahore\", \"user_id\": \"11\", \"diary_no\": \"LHR-D-1325/26\", \"evidence\": [\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"], \"circle_id\": \"4\", \"contact_no\": \"032-5257753\", \"created_at\": \"2026-07-04T10:48:21.000000Z\", \"entry_time\": \"2026-07-09T16:20:00.000000Z\", \"profession\": \"Student\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"description\": \"Complaint regarding identity theft — detailed description of the incident involving Iftikhar Ahmed. Further investigation required to ascertain the facts.\", \"operator_id\": \"4\", \"report_date\": \"2026-05-05\", \"tracking_no\": \"UET-C-0100/26\", \"final_status\": null, \"offence_type\": \"anti_state\", \"received_via\": \"Telephone\", \"operator_name\": \"Muhammad Umar Ilyas\", \"priority_type\": \"higher_authority\", \"received_from\": \"PM Office\", \"amount_involved\": \"3860638.00\", \"occurrence_date\": \"2026-07-16\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"Iftikhar Ahmed\", \"operator_remarks\": \"Initial review completed. Case requires verification.\", \"operator_designation\": \"Asst. Sub Inspector\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(101, 'default', 'created', 'App\\Models\\Verification', 'created', 1, NULL, NULL, '{\"attributes\": {\"id\": 1, \"status\": \"submitted\", \"created_at\": \"2026-07-16T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-09T10:48:21.000000Z\", \"assigned_by\": \"1\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"11\", \"completed_at\": null, \"submitted_at\": \"2026-07-12T10:48:21.000000Z\", \"priority_type\": \"court\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"4\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(102, 'default', 'created', 'App\\Models\\Verification', 'created', 2, NULL, NULL, '{\"attributes\": {\"id\": 2, \"status\": \"sent_back\", \"created_at\": \"2026-07-03T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-09T10:48:21.000000Z\", \"assigned_by\": \"11\", \"report_text\": null, \"complaint_id\": \"35\", \"completed_at\": null, \"submitted_at\": \"2026-07-10T10:48:21.000000Z\", \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(103, 'default', 'created', 'App\\Models\\Verification', 'created', 3, NULL, NULL, '{\"attributes\": {\"id\": 3, \"status\": \"assigned\", \"created_at\": \"2026-07-15T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-06T10:48:21.000000Z\", \"assigned_by\": \"2\", \"report_text\": null, \"complaint_id\": \"38\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"court\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(104, 'default', 'created', 'App\\Models\\Verification', 'created', 4, NULL, NULL, '{\"attributes\": {\"id\": 4, \"status\": \"pending_assignment\", \"created_at\": \"2026-06-26T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-10T10:48:21.000000Z\", \"assigned_by\": \"2\", \"report_text\": null, \"complaint_id\": \"43\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"anti_state\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"3\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(105, 'default', 'created', 'App\\Models\\Verification', 'created', 5, NULL, NULL, '{\"attributes\": {\"id\": 5, \"status\": \"approved\", \"created_at\": \"2026-07-11T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-07-16T10:48:21.000000Z\", \"assigned_by\": \"5\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"66\", \"completed_at\": null, \"submitted_at\": \"2026-07-07T10:48:21.000000Z\", \"priority_type\": \"anti_state\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(106, 'default', 'created', 'App\\Models\\Verification', 'created', 6, NULL, NULL, '{\"attributes\": {\"id\": 6, \"status\": \"assigned\", \"created_at\": \"2026-06-26T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-06-30T10:48:21.000000Z\", \"assigned_by\": \"11\", \"report_text\": null, \"complaint_id\": \"69\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"higher_authority\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(107, 'default', 'created', 'App\\Models\\Verification', 'created', 7, NULL, NULL, '{\"attributes\": {\"id\": 7, \"status\": \"approved\", \"created_at\": \"2026-06-24T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-07-10T10:48:21.000000Z\", \"assigned_by\": \"5\", \"report_text\": null, \"complaint_id\": \"77\", \"completed_at\": null, \"submitted_at\": \"2026-07-08T10:48:21.000000Z\", \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"3\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(108, 'default', 'created', 'App\\Models\\Verification', 'created', 8, NULL, NULL, '{\"attributes\": {\"id\": 8, \"status\": \"approved\", \"created_at\": \"2026-06-27T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-06-27T10:48:21.000000Z\", \"assigned_by\": \"4\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"82\", \"completed_at\": null, \"submitted_at\": \"2026-07-13T10:48:21.000000Z\", \"priority_type\": \"court\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(109, 'default', 'created', 'App\\Models\\Verification', 'created', 9, NULL, NULL, '{\"attributes\": {\"id\": 9, \"status\": \"pending_assignment\", \"created_at\": \"2026-07-01T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-13T10:48:21.000000Z\", \"assigned_by\": \"7\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"92\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"2\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(110, 'default', 'created', 'App\\Models\\Verification', 'created', 10, NULL, NULL, '{\"attributes\": {\"id\": 10, \"status\": \"approved\", \"created_at\": \"2026-07-07T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-06-27T10:48:21.000000Z\", \"assigned_by\": \"5\", \"report_text\": null, \"complaint_id\": \"99\", \"completed_at\": null, \"submitted_at\": \"2026-07-13T10:48:21.000000Z\", \"priority_type\": \"higher_authority\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(111, 'default', 'created', 'App\\Models\\Verification', 'created', 11, NULL, NULL, '{\"attributes\": {\"id\": 11, \"status\": \"in_progress\", \"created_at\": \"2026-06-24T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-11T10:48:21.000000Z\", \"assigned_by\": \"4\", \"report_text\": null, \"complaint_id\": \"100\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"anti_state\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-17 05:48:21', '2026-07-17 05:48:21'),
(112, 'default', 'created', 'App\\Models\\Complaint', 'created', 101, 'App\\Models\\User', 15, '{\"attributes\": {\"id\": 101, \"cmu\": \"xyz\", \"cnic\": \"77777-7777777-7\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"xyz\", \"user_id\": \"15\", \"diary_no\": \"7777\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3895895899\", \"created_at\": \"2026-07-24T07:54:08.000000Z\", \"entry_time\": \"2026-07-24T12:51:00.000000Z\", \"profession\": \"xyz\", \"updated_at\": \"2026-07-24T07:54:08.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-23\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"7777\", \"operator_name\": \"abc\", \"priority_type\": \"regular\", \"received_from\": \"7777\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-16\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"talha\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"constable\"}}', NULL, '2026-07-24 02:54:08', '2026-07-24 02:54:08'),
(113, 'default', 'created', 'App\\Models\\Complaint', 'created', 102, 'App\\Models\\User', 15, '{\"attributes\": {\"id\": 102, \"cmu\": \"xyz\", \"cnic\": \"77777-7777777-7\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"xyz\", \"user_id\": \"15\", \"diary_no\": \"7777\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3895895899\", \"created_at\": \"2026-07-24T07:56:43.000000Z\", \"entry_time\": \"2026-07-24T12:51:00.000000Z\", \"profession\": \"xyz\", \"updated_at\": \"2026-07-24T07:56:43.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-23\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"7777\", \"operator_name\": \"abc\", \"priority_type\": \"regular\", \"received_from\": \"7777\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-16\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"talha\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"constable\"}}', NULL, '2026-07-24 02:56:43', '2026-07-24 02:56:43'),
(114, 'default', 'created', 'App\\Models\\Verification', 'created', 12, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 12, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:02:27.000000Z\", \"updated_at\": \"2026-07-24T08:02:27.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:02:27.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"35\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-24 03:02:27', '2026-07-24 03:02:27'),
(115, 'default', 'created', 'App\\Models\\Verification', 'created', 13, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 13, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:04:22.000000Z\", \"updated_at\": \"2026-07-24T08:04:22.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:04:22.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"26\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"17\"}}', NULL, '2026-07-24 03:04:22', '2026-07-24 03:04:22'),
(116, 'default', 'created', 'App\\Models\\Verification', 'created', 14, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 14, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:06:15.000000Z\", \"updated_at\": \"2026-07-24T08:06:15.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:06:15.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"17\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-24 03:06:15', '2026-07-24 03:06:15'),
(117, 'default', 'created', 'App\\Models\\Verification', 'created', 15, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 15, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:06:42.000000Z\", \"updated_at\": \"2026-07-24T08:06:42.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:06:42.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"26\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-24 03:06:42', '2026-07-24 03:06:42'),
(118, 'verifications', 'Verification deleted: #15', 'App\\Models\\Verification', NULL, 15, 'App\\Models\\User', 12, '{\"id\": 15}', NULL, '2026-07-24 03:07:11', '2026-07-24 03:07:11'),
(119, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 15, 'App\\Models\\User', 12, '{\"old\": {\"id\": 15, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:06:42.000000Z\", \"updated_at\": \"2026-07-24T08:06:42.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:06:42.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"26\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-24 03:07:11', '2026-07-24 03:07:11'),
(120, 'verifications', 'Verification deleted: #14', 'App\\Models\\Verification', NULL, 14, 'App\\Models\\User', 12, '{\"id\": 14}', NULL, '2026-07-24 03:07:14', '2026-07-24 03:07:14'),
(121, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 14, 'App\\Models\\User', 12, '{\"old\": {\"id\": 14, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:06:15.000000Z\", \"updated_at\": \"2026-07-24T08:06:15.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:06:15.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"17\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-24 03:07:14', '2026-07-24 03:07:14'),
(122, 'verifications', 'Verification deleted: #13', 'App\\Models\\Verification', NULL, 13, 'App\\Models\\User', 12, '{\"id\": 13}', NULL, '2026-07-24 03:07:17', '2026-07-24 03:07:17'),
(123, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 13, 'App\\Models\\User', 12, '{\"old\": {\"id\": 13, \"status\": \"assigned\", \"created_at\": \"2026-07-24T08:04:22.000000Z\", \"updated_at\": \"2026-07-24T08:04:22.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T08:04:22.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"26\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"17\"}}', NULL, '2026-07-24 03:07:17', '2026-07-24 03:07:17'),
(124, 'default', 'created', 'App\\Models\\Verification', 'created', 16, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 16, \"status\": \"assigned\", \"created_at\": \"2026-07-24T09:39:22.000000Z\", \"updated_at\": \"2026-07-24T09:39:22.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T09:39:22.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"26\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"higher_authority\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-24 04:39:22', '2026-07-24 04:39:22'),
(125, 'default', 'created', 'App\\Models\\Complaint', 'created', 103, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 103, \"cmu\": \"adfs\", \"cnic\": \"34101-9565656-5\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"none\", \"user_id\": \"12\", \"diary_no\": \"123546\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3344400443\", \"created_at\": \"2026-07-24T10:33:42.000000Z\", \"entry_time\": \"2026-07-22T15:38:00.000000Z\", \"profession\": \"Abc\", \"updated_at\": \"2026-07-24T10:33:42.000000Z\", \"description\": \"testing\", \"operator_id\": null, \"report_date\": \"2026-07-23\", \"tracking_no\": \"CCW-1/26\", \"final_status\": null, \"offence_type\": \"cyber_terrorism\", \"received_via\": \"abc\", \"operator_name\": \"sadadsf\", \"priority_type\": \"regular\", \"received_from\": \"xyz\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-22\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"testing\", \"operator_remarks\": \"sdfadf\", \"contact_country_code\": \"+92\", \"operator_designation\": \"adsfadf\"}}', NULL, '2026-07-24 05:33:42', '2026-07-24 05:33:42'),
(126, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 103, 'App\\Models\\User', 12, '{\"old\": {\"updated_at\": \"2026-07-24T10:33:42.000000Z\", \"offence_type\": \"cyber_terrorism\"}, \"attributes\": {\"updated_at\": \"2026-07-24T10:36:36.000000Z\", \"offence_type\": \"data_breach\"}}', NULL, '2026-07-24 05:36:36', '2026-07-24 05:36:36'),
(127, 'default', 'created', 'App\\Models\\Verification', 'created', 17, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 17, \"status\": \"assigned\", \"created_at\": \"2026-07-24T10:44:17.000000Z\", \"updated_at\": \"2026-07-24T10:44:17.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T10:44:17.000000Z\", \"assigned_by\": \"12\", \"report_text\": \"sdsfasdfa\", \"complaint_id\": \"103\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"18\"}}', NULL, '2026-07-24 05:44:17', '2026-07-24 05:44:17'),
(128, 'default', 'updated', 'App\\Models\\Verification', 'updated', 17, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"assigned\", \"updated_at\": \"2026-07-24T10:44:17.000000Z\"}, \"attributes\": {\"status\": \"in_progress\", \"updated_at\": \"2026-07-24T11:22:26.000000Z\"}}', NULL, '2026-07-24 06:22:26', '2026-07-24 06:22:26'),
(129, 'verifications', 'Verification deleted: #17', 'App\\Models\\Verification', NULL, 17, 'App\\Models\\User', 12, '{\"id\": 17}', NULL, '2026-07-25 02:23:57', '2026-07-25 02:23:57'),
(130, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 17, 'App\\Models\\User', 12, '{\"old\": {\"id\": 17, \"status\": \"in_progress\", \"created_at\": \"2026-07-24T10:44:17.000000Z\", \"updated_at\": \"2026-07-24T11:22:26.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-24T10:44:17.000000Z\", \"assigned_by\": \"12\", \"report_text\": \"sdsfasdfa\", \"complaint_id\": \"103\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"18\"}}', NULL, '2026-07-25 02:23:57', '2026-07-25 02:23:57'),
(131, 'default', 'created', 'App\\Models\\Complaint', 'created', 104, 'App\\Models\\User', 15, '{\"attributes\": {\"id\": 104, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"15\", \"diary_no\": \"2222\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T12:39:06.000000Z\", \"entry_time\": \"2026-07-25T17:35:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T12:39:06.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-24\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyber_terrorism\", \"received_via\": \"na\", \"operator_name\": \"ali raza\", \"priority_type\": \"high\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-24\", \"scrutiny_result\": null, \"complainant_name\": \"hammd\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"sub inspector\"}}', NULL, '2026-07-25 07:39:06', '2026-07-25 07:39:06'),
(132, 'complaints', 'Complaint deleted: CCW-1/26', 'App\\Models\\Complaint', NULL, 103, 'App\\Models\\User', 15, '{\"tracking_no\": \"CCW-1/26\"}', NULL, '2026-07-25 07:40:04', '2026-07-25 07:40:04'),
(133, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 103, 'App\\Models\\User', 15, '{\"old\": {\"id\": 103, \"cmu\": \"adfs\", \"cnic\": \"34101-9565656-5\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"none\", \"user_id\": \"12\", \"diary_no\": \"123546\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3344400443\", \"created_at\": \"2026-07-24T10:33:42.000000Z\", \"entry_time\": \"2026-07-22T15:38:00.000000Z\", \"profession\": \"Abc\", \"updated_at\": \"2026-07-24T10:36:36.000000Z\", \"description\": \"testing\", \"operator_id\": null, \"report_date\": \"2026-07-23\", \"tracking_no\": \"CCW-1/26\", \"final_status\": null, \"offence_type\": \"data_breach\", \"received_via\": \"abc\", \"operator_name\": \"sadadsf\", \"priority_type\": \"regular\", \"received_from\": \"xyz\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-22\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"testing\", \"operator_remarks\": \"sdfadf\", \"contact_country_code\": \"+92\", \"operator_designation\": \"adsfadf\"}}', NULL, '2026-07-25 07:40:04', '2026-07-25 07:40:04'),
(134, 'default', 'created', 'App\\Models\\Complaint', 'created', 105, 'App\\Models\\User', 15, '{\"attributes\": {\"id\": 105, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"15\", \"diary_no\": \"222\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T12:41:00.000000Z\", \"entry_time\": \"2026-07-25T17:37:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T12:41:00.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-25\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"na\", \"operator_name\": \"ali raza\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-24\", \"scrutiny_result\": null, \"complainant_name\": \"ahmed\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"sub inspector\"}}', NULL, '2026-07-25 07:41:00', '2026-07-25 07:41:00'),
(135, 'default', 'created', 'App\\Models\\Complaint', 'created', 106, 'App\\Models\\User', 19, '{\"attributes\": {\"id\": 106, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"19\", \"diary_no\": \"777\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"9999999999\", \"created_at\": \"2026-07-25T12:44:17.000000Z\", \"entry_time\": \"2026-07-25T17:42:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T12:44:17.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-24\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"ransomware\", \"received_via\": \"na\", \"operator_name\": \"ahmed\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-23\", \"scrutiny_result\": null, \"complainant_name\": \"arslan\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"aditional director\"}}', NULL, '2026-07-25 07:44:17', '2026-07-25 07:44:17'),
(136, 'default', 'updated', 'App\\Models\\Verification', 'updated', 9, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"pending_assignment\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"priority_type\": \"regular\", \"verification_officer_id\": \"2\"}, \"attributes\": {\"status\": \"submitted\", \"updated_at\": \"2026-07-25T13:49:41.000000Z\", \"priority_type\": \"normal\", \"verification_officer_id\": \"18\"}}', NULL, '2026-07-25 08:49:41', '2026-07-25 08:49:41'),
(137, 'verifications', 'Verification deleted: #1', 'App\\Models\\Verification', NULL, 1, 'App\\Models\\User', 12, '{\"id\": 1}', NULL, '2026-07-25 08:49:51', '2026-07-25 08:49:51'),
(138, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 1, 'App\\Models\\User', 12, '{\"old\": {\"id\": 1, \"status\": \"submitted\", \"created_at\": \"2026-07-16T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-09T10:48:21.000000Z\", \"assigned_by\": \"1\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"11\", \"completed_at\": null, \"submitted_at\": \"2026-07-12T10:48:21.000000Z\", \"priority_type\": \"court\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"4\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:49:51', '2026-07-25 08:49:51'),
(139, 'verifications', 'Verification deleted: #9', 'App\\Models\\Verification', NULL, 9, 'App\\Models\\User', 12, '{\"id\": 9}', NULL, '2026-07-25 08:49:53', '2026-07-25 08:49:53'),
(140, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 9, 'App\\Models\\User', 12, '{\"old\": {\"id\": 9, \"status\": \"submitted\", \"created_at\": \"2026-07-01T10:48:21.000000Z\", \"updated_at\": \"2026-07-25T13:49:41.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-13T10:48:21.000000Z\", \"assigned_by\": \"7\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"92\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"normal\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"2\", \"transfer_department\": null, \"verification_officer_id\": \"18\"}}', NULL, '2026-07-25 08:49:54', '2026-07-25 08:49:54'),
(141, 'verifications', 'Verification deleted: #11', 'App\\Models\\Verification', NULL, 11, 'App\\Models\\User', 12, '{\"id\": 11}', NULL, '2026-07-25 08:50:08', '2026-07-25 08:50:08'),
(142, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 11, 'App\\Models\\User', 12, '{\"old\": {\"id\": 11, \"status\": \"in_progress\", \"created_at\": \"2026-06-24T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-11T10:48:21.000000Z\", \"assigned_by\": \"4\", \"report_text\": null, \"complaint_id\": \"100\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"anti_state\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:08', '2026-07-25 08:50:08'),
(143, 'verifications', 'Verification deleted: #7', 'App\\Models\\Verification', NULL, 7, 'App\\Models\\User', 12, '{\"id\": 7}', NULL, '2026-07-25 08:50:11', '2026-07-25 08:50:11'),
(144, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 7, 'App\\Models\\User', 12, '{\"old\": {\"id\": 7, \"status\": \"approved\", \"created_at\": \"2026-06-24T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-07-10T10:48:21.000000Z\", \"assigned_by\": \"5\", \"report_text\": null, \"complaint_id\": \"77\", \"completed_at\": null, \"submitted_at\": \"2026-07-08T10:48:21.000000Z\", \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"3\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:11', '2026-07-25 08:50:11'),
(145, 'verifications', 'Verification deleted: #6', 'App\\Models\\Verification', NULL, 6, 'App\\Models\\User', 12, '{\"id\": 6}', NULL, '2026-07-25 08:50:14', '2026-07-25 08:50:14'),
(146, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 6, 'App\\Models\\User', 12, '{\"old\": {\"id\": 6, \"status\": \"assigned\", \"created_at\": \"2026-06-26T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-06-30T10:48:21.000000Z\", \"assigned_by\": \"11\", \"report_text\": null, \"complaint_id\": \"69\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"higher_authority\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:14', '2026-07-25 08:50:14'),
(147, 'verifications', 'Verification deleted: #4', 'App\\Models\\Verification', NULL, 4, 'App\\Models\\User', 12, '{\"id\": 4}', NULL, '2026-07-25 08:50:17', '2026-07-25 08:50:17'),
(148, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 4, 'App\\Models\\User', 12, '{\"old\": {\"id\": 4, \"status\": \"pending_assignment\", \"created_at\": \"2026-06-26T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-10T10:48:21.000000Z\", \"assigned_by\": \"2\", \"report_text\": null, \"complaint_id\": \"43\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"anti_state\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"3\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:17', '2026-07-25 08:50:17'),
(149, 'verifications', 'Verification deleted: #8', 'App\\Models\\Verification', NULL, 8, 'App\\Models\\User', 12, '{\"id\": 8}', NULL, '2026-07-25 08:50:20', '2026-07-25 08:50:20'),
(150, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 8, 'App\\Models\\User', 12, '{\"old\": {\"id\": 8, \"status\": \"approved\", \"created_at\": \"2026-06-27T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-06-27T10:48:21.000000Z\", \"assigned_by\": \"4\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"82\", \"completed_at\": null, \"submitted_at\": \"2026-07-13T10:48:21.000000Z\", \"priority_type\": \"court\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:20', '2026-07-25 08:50:20'),
(151, 'verifications', 'Verification deleted: #2', 'App\\Models\\Verification', NULL, 2, 'App\\Models\\User', 12, '{\"id\": 2}', NULL, '2026-07-25 08:50:22', '2026-07-25 08:50:22'),
(152, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 2, 'App\\Models\\User', 12, '{\"old\": {\"id\": 2, \"status\": \"sent_back\", \"created_at\": \"2026-07-03T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-09T10:48:21.000000Z\", \"assigned_by\": \"11\", \"report_text\": null, \"complaint_id\": \"35\", \"completed_at\": null, \"submitted_at\": \"2026-07-10T10:48:21.000000Z\", \"priority_type\": \"regular\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": \"1\", \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:22', '2026-07-25 08:50:22'),
(153, 'verifications', 'Verification deleted: #5', 'App\\Models\\Verification', NULL, 5, 'App\\Models\\User', 12, '{\"id\": 5}', NULL, '2026-07-25 08:50:36', '2026-07-25 08:50:36'),
(154, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 5, 'App\\Models\\User', 12, '{\"old\": {\"id\": 5, \"status\": \"approved\", \"created_at\": \"2026-07-11T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-07-16T10:48:21.000000Z\", \"assigned_by\": \"5\", \"report_text\": \"Verification completed. All details verified.\", \"complaint_id\": \"66\", \"completed_at\": null, \"submitted_at\": \"2026-07-07T10:48:21.000000Z\", \"priority_type\": \"anti_state\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:36', '2026-07-25 08:50:36'),
(155, 'verifications', 'Verification deleted: #10', 'App\\Models\\Verification', NULL, 10, 'App\\Models\\User', 12, '{\"id\": 10}', NULL, '2026-07-25 08:50:41', '2026-07-25 08:50:41'),
(156, 'default', 'deleted', 'App\\Models\\Verification', 'deleted', 10, 'App\\Models\\User', 12, '{\"old\": {\"id\": 10, \"status\": \"approved\", \"created_at\": \"2026-07-07T10:48:21.000000Z\", \"updated_at\": \"2026-07-17T10:48:21.000000Z\", \"approved_at\": \"2026-07-17T10:48:21.000000Z\", \"assigned_at\": \"2026-06-27T10:48:21.000000Z\", \"assigned_by\": \"5\", \"report_text\": null, \"complaint_id\": \"99\", \"completed_at\": null, \"submitted_at\": \"2026-07-13T10:48:21.000000Z\", \"priority_type\": \"higher_authority\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-25 08:50:41', '2026-07-25 08:50:41'),
(157, 'complaints', 'Complaint deleted: 106', 'App\\Models\\Complaint', NULL, 106, 'App\\Models\\User', 12, '{\"tracking_no\": null}', NULL, '2026-07-25 08:51:57', '2026-07-25 08:51:57'),
(158, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 106, 'App\\Models\\User', 12, '{\"old\": {\"id\": 106, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"19\", \"diary_no\": \"777\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"9999999999\", \"created_at\": \"2026-07-25T12:44:17.000000Z\", \"entry_time\": \"2026-07-25T17:42:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T12:44:17.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-24\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"ransomware\", \"received_via\": \"na\", \"operator_name\": \"ahmed\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-23\", \"scrutiny_result\": null, \"complainant_name\": \"arslan\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"aditional director\"}}', NULL, '2026-07-25 08:51:57', '2026-07-25 08:51:57'),
(159, 'complaints', 'Complaint deleted: 105', 'App\\Models\\Complaint', NULL, 105, 'App\\Models\\User', 12, '{\"tracking_no\": null}', NULL, '2026-07-25 08:52:02', '2026-07-25 08:52:02'),
(160, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 105, 'App\\Models\\User', 12, '{\"old\": {\"id\": 105, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"15\", \"diary_no\": \"222\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T12:41:00.000000Z\", \"entry_time\": \"2026-07-25T17:37:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T12:41:00.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-25\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"na\", \"operator_name\": \"ali raza\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-24\", \"scrutiny_result\": null, \"complainant_name\": \"ahmed\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"sub inspector\"}}', NULL, '2026-07-25 08:52:02', '2026-07-25 08:52:02'),
(161, 'complaints', 'Complaint deleted: 104', 'App\\Models\\Complaint', NULL, 104, 'App\\Models\\User', 12, '{\"tracking_no\": null}', NULL, '2026-07-25 08:52:04', '2026-07-25 08:52:04'),
(162, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 104, 'App\\Models\\User', 12, '{\"old\": {\"id\": 104, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"15\", \"diary_no\": \"2222\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T12:39:06.000000Z\", \"entry_time\": \"2026-07-25T17:35:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T12:39:06.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-24\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyber_terrorism\", \"received_via\": \"na\", \"operator_name\": \"ali raza\", \"priority_type\": \"high\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-24\", \"scrutiny_result\": null, \"complainant_name\": \"hammd\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"sub inspector\"}}', NULL, '2026-07-25 08:52:04', '2026-07-25 08:52:04'),
(163, 'complaints', 'Complaint deleted: 102', 'App\\Models\\Complaint', NULL, 102, 'App\\Models\\User', 12, '{\"tracking_no\": null}', NULL, '2026-07-25 08:52:06', '2026-07-25 08:52:06'),
(164, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 102, 'App\\Models\\User', 12, '{\"old\": {\"id\": 102, \"cmu\": \"xyz\", \"cnic\": \"77777-7777777-7\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"xyz\", \"user_id\": \"15\", \"diary_no\": \"7777\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3895895899\", \"created_at\": \"2026-07-24T07:56:43.000000Z\", \"entry_time\": \"2026-07-24T12:51:00.000000Z\", \"profession\": \"xyz\", \"updated_at\": \"2026-07-24T07:56:43.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-23\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"7777\", \"operator_name\": \"abc\", \"priority_type\": \"regular\", \"received_from\": \"7777\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-16\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"talha\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"constable\"}}', NULL, '2026-07-25 08:52:06', '2026-07-25 08:52:06'),
(165, 'complaints', 'Complaint deleted: 101', 'App\\Models\\Complaint', NULL, 101, 'App\\Models\\User', 12, '{\"tracking_no\": null}', NULL, '2026-07-25 08:52:09', '2026-07-25 08:52:09'),
(166, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 101, 'App\\Models\\User', 12, '{\"old\": {\"id\": 101, \"cmu\": \"xyz\", \"cnic\": \"77777-7777777-7\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"xyz\", \"user_id\": \"15\", \"diary_no\": \"7777\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3895895899\", \"created_at\": \"2026-07-24T07:54:08.000000Z\", \"entry_time\": \"2026-07-24T12:51:00.000000Z\", \"profession\": \"xyz\", \"updated_at\": \"2026-07-24T07:54:08.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-23\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"7777\", \"operator_name\": \"abc\", \"priority_type\": \"regular\", \"received_from\": \"7777\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-16\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"talha\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"constable\"}}', NULL, '2026-07-25 08:52:09', '2026-07-25 08:52:09'),
(167, 'default', 'created', 'App\\Models\\Complaint', 'created', 107, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 107, \"cmu\": null, \"cnic\": \"99999-9999999-9\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"222\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T13:55:15.000000Z\", \"entry_time\": \"2026-07-25T18:52:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T13:55:15.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-25\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"email_spoofing\", \"received_via\": \"na\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-24\", \"scrutiny_result\": null, \"complainant_name\": \"javed\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-25 08:55:15', '2026-07-25 08:55:15'),
(168, 'complaints', 'Complaint deleted: 107', 'App\\Models\\Complaint', NULL, 107, 'App\\Models\\User', 12, '{\"tracking_no\": null}', NULL, '2026-07-25 09:07:02', '2026-07-25 09:07:02'),
(169, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 107, 'App\\Models\\User', 12, '{\"old\": {\"id\": 107, \"cmu\": null, \"cnic\": \"99999-9999999-9\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"222\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T13:55:15.000000Z\", \"entry_time\": \"2026-07-25T18:52:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T13:55:15.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-25\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"email_spoofing\", \"received_via\": \"na\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-24\", \"scrutiny_result\": null, \"complainant_name\": \"javed\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-25 09:07:02', '2026-07-25 09:07:02'),
(170, 'default', 'created', 'App\\Models\\Complaint', 'created', 108, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 108, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"22\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T14:08:04.000000Z\", \"entry_time\": \"2026-07-25T19:04:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T14:08:04.000000Z\", \"description\": \"nv\", \"operator_id\": null, \"report_date\": \"2026-07-24\", \"tracking_no\": \"1/26\", \"final_status\": null, \"offence_type\": \"child_abuse\", \"received_via\": \"nv\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"jhbh\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-25\", \"scrutiny_result\": null, \"complainant_name\": \"xyz\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-25 09:08:04', '2026-07-25 09:08:04'),
(171, 'default', 'created', 'App\\Models\\Verification', 'created', 18, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 18, \"status\": \"assigned\", \"created_at\": \"2026-07-25T14:08:28.000000Z\", \"updated_at\": \"2026-07-25T14:08:28.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-25T14:08:28.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"108\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"normal\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-25 09:08:28', '2026-07-25 09:08:28'),
(172, 'complaints', 'Complaint deleted: 1/26', 'App\\Models\\Complaint', NULL, 108, 'App\\Models\\User', 12, '{\"tracking_no\": \"1/26\"}', NULL, '2026-07-25 10:46:42', '2026-07-25 10:46:42'),
(173, 'default', 'deleted', 'App\\Models\\Complaint', 'deleted', 108, 'App\\Models\\User', 12, '{\"old\": {\"id\": 108, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"22\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3333333333\", \"created_at\": \"2026-07-25T14:08:04.000000Z\", \"entry_time\": \"2026-07-25T19:04:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-25T14:08:04.000000Z\", \"description\": \"nv\", \"operator_id\": null, \"report_date\": \"2026-07-24\", \"tracking_no\": \"1/26\", \"final_status\": null, \"offence_type\": \"child_abuse\", \"received_via\": \"nv\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"jhbh\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-25\", \"scrutiny_result\": null, \"complainant_name\": \"xyz\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-25 10:46:42', '2026-07-25 10:46:42'),
(174, 'default', 'created', 'App\\Models\\Complaint', 'created', 109, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 109, \"cmu\": null, \"cnic\": \"00000-0000000-0\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"88\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"9898898988\", \"created_at\": \"2026-07-25T15:48:23.000000Z\", \"entry_time\": \"2026-07-25T20:46:00.000000Z\", \"profession\": \"na\", \"updated_at\": \"2026-07-25T15:48:23.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-25\", \"tracking_no\": \"1/26\", \"final_status\": null, \"offence_type\": \"cyber_terrorism\", \"received_via\": \"av\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"hj\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-22\", \"scrutiny_result\": null, \"complainant_name\": \"xyzabc\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-25 10:48:23', '2026-07-25 10:48:23');
INSERT INTO `activity_log` (`id`, `log_name`, `description`, `subject_type`, `event`, `subject_id`, `causer_type`, `causer_id`, `properties`, `batch_uuid`, `created_at`, `updated_at`) VALUES
(175, 'default', 'created', 'App\\Models\\Verification', 'created', 19, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 19, \"status\": \"assigned\", \"created_at\": \"2026-07-25T15:49:45.000000Z\", \"updated_at\": \"2026-07-25T15:49:45.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-25T15:49:45.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"109\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"normal\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"15\"}}', NULL, '2026-07-25 10:49:45', '2026-07-25 10:49:45'),
(176, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 12, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"incomplete\", \"contact_no\": \"030-9190876\", \"updated_at\": \"2026-07-17T10:48:19.000000Z\", \"tracking_no\": null, \"offence_type\": \"anti_state\"}, \"attributes\": {\"status\": \"complete\", \"contact_no\": \"309190876\", \"updated_at\": \"2026-07-26T04:52:07.000000Z\", \"tracking_no\": \"UET-1/26\", \"offence_type\": \"online_fraud\"}}', NULL, '2026-07-25 23:52:07', '2026-07-25 23:52:07'),
(177, 'default', 'created', 'App\\Models\\Complaint', 'created', 205, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 205, \"cmu\": \"na\", \"cnic\": \"87467-7673467-6\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"8888\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"6674467746\", \"created_at\": \"2026-07-27T11:39:16.000000Z\", \"entry_time\": \"2026-07-27T16:35:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-27T11:39:16.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-27\", \"tracking_no\": \"1/26\", \"final_status\": null, \"offence_type\": \"defamation\", \"received_via\": \"na\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"na\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-29\", \"scrutiny_result\": null, \"complainant_name\": \"ahmmad\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-27 06:39:16', '2026-07-27 06:39:16'),
(178, 'default', 'created', 'App\\Models\\Complaint', 'created', 236, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 236, \"cmu\": \"Zonal Directorate\", \"cnic\": \"89446-8483468-4\", \"laws\": [], \"source\": null, \"status\": \"complete\", \"address\": \"na\", \"user_id\": \"12\", \"diary_no\": \"8888\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"8644348446\", \"created_at\": \"2026-07-27T16:42:07.000000Z\", \"entry_time\": \"2026-07-27T21:39:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-07-27T16:42:07.000000Z\", \"description\": \"na\", \"operator_id\": null, \"report_date\": \"2026-07-26\", \"tracking_no\": \"101/26\", \"final_status\": null, \"offence_type\": \"ransomware\", \"received_via\": \"Email\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"NGOs\", \"amount_involved\": null, \"occurrence_date\": \"2026-07-20\", \"scrutiny_result\": \"complete\", \"complainant_name\": \"arhum\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\"}}', NULL, '2026-07-27 11:42:07', '2026-07-27 11:42:07'),
(179, 'default', 'created', 'App\\Models\\Enquiry', 'created', 1, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 1, \"status\": \"registered\", \"reg_date\": \"2026-07-28\", \"created_at\": \"2026-07-28T04:52:43.000000Z\", \"updated_at\": \"2026-07-28T04:52:43.000000Z\", \"approved_at\": null, \"cfr_summary\": null, \"case_file_id\": null, \"complaint_id\": \"236\", \"submitted_at\": null, \"closure_reason\": \"non_pursuance\", \"enquiry_number\": \"CCW-E-1/26\", \"recommendation\": \"closure\", \"assignment_date\": null, \"transfer_circle\": \"Islamabad Circle\", \"enquiry_officer_id\": \"20\", \"merge_complaint_id\": null, \"transfer_department\": \"na\"}}', NULL, '2026-07-27 23:52:43', '2026-07-27 23:52:43'),
(180, 'default', 'created', 'App\\Models\\CaseFile', 'created', 1, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 1, \"fir_no\": \"CCW-F-1/26\", \"status\": \"registered\", \"created_at\": \"2026-07-28T05:00:16.000000Z\", \"enquiry_id\": \"1\", \"updated_at\": \"2026-07-28T05:00:16.000000Z\", \"recommendation\": null, \"transfer_circle\": null, \"merge_complaint_id\": null, \"transfer_department\": null, \"investigation_officer_id\": \"15\"}}', NULL, '2026-07-28 00:00:16', '2026-07-28 00:00:16'),
(181, 'default', 'created', 'App\\Models\\Complaint', 'created', 237, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 237, \"cmu\": \"NCCIA - HQ\", \"cnic\": \"34101-7628323-3\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"Bilal town\", \"user_id\": \"12\", \"diary_no\": \"3\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"7238963982\", \"created_at\": \"2026-07-28T06:29:18.000000Z\", \"enquiry_id\": null, \"entry_time\": \"2026-07-28T11:27:00.000000Z\", \"profession\": \"Development\", \"updated_at\": \"2026-07-28T06:29:18.000000Z\", \"description\": \"123\", \"operator_id\": null, \"report_date\": \"2026-07-28\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"financial_fraud\", \"received_via\": \"Individually\", \"operator_name\": \"Admin\", \"priority_type\": \"high\", \"received_from\": \"National & International (Tipline)\", \"closure_reason\": null, \"merged_with_id\": null, \"amount_involved\": \"12312.00\", \"occurrence_date\": \"2026-07-28\", \"scrutiny_result\": null, \"complainant_name\": \"shahan\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\", \"transfer_to_circle_id\": null, \"transfer_to_department\": null}}', NULL, '2026-07-28 01:29:18', '2026-07-28 01:29:18'),
(182, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 237, 'App\\Models\\User', 12, '{\"old\": {\"updated_at\": \"2026-07-28T06:29:18.000000Z\", \"scrutiny_result\": null}, \"attributes\": {\"updated_at\": \"2026-07-28T06:29:32.000000Z\", \"scrutiny_result\": \"incomplete\"}}', NULL, '2026-07-28 01:29:32', '2026-07-28 01:29:32'),
(183, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 237, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"incomplete\", \"updated_at\": \"2026-07-28T06:29:32.000000Z\", \"tracking_no\": null, \"scrutiny_result\": \"incomplete\"}, \"attributes\": {\"status\": \"complete\", \"updated_at\": \"2026-07-28T06:34:03.000000Z\", \"tracking_no\": \"102/26\", \"scrutiny_result\": \"complete\"}}', NULL, '2026-07-28 01:34:03', '2026-07-28 01:34:03'),
(184, 'default', 'created', 'App\\Models\\Verification', 'created', 20, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 20, \"status\": \"assigned\", \"created_at\": \"2026-07-28T06:35:06.000000Z\", \"updated_at\": \"2026-07-28T06:35:06.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-28T06:35:06.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"237\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"critical\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-28 01:35:06', '2026-07-28 01:35:06'),
(185, 'default', 'created', 'App\\Models\\Complaint', 'created', 238, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 238, \"cmu\": \"NCCIA - HQ\", \"cnic\": \"34101-5124365-5\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"fchgkjcbm.\", \"user_id\": \"12\", \"diary_no\": \"2465\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3320141562\", \"created_at\": \"2026-07-29T07:32:39.000000Z\", \"enquiry_id\": null, \"entry_time\": \"2026-07-29T12:19:00.000000Z\", \"profession\": \"nmkjhg\", \"updated_at\": \"2026-07-29T07:32:39.000000Z\", \"description\": \"fgdxgtgjmcghfv\", \"operator_id\": null, \"report_date\": \"2026-07-29\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"online_fraud\", \"received_via\": \"Individually\", \"operator_name\": \"Admin\", \"priority_type\": \"high\", \"received_from\": \"General Public\", \"closure_reason\": null, \"merged_with_id\": null, \"amount_involved\": \"500000.00\", \"occurrence_date\": \"2026-07-29\", \"scrutiny_result\": null, \"complainant_name\": \"zillay\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\", \"transfer_to_circle_id\": null, \"transfer_to_department\": null}}', NULL, '2026-07-29 02:32:39', '2026-07-29 02:32:39'),
(186, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 238, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"incomplete\", \"updated_at\": \"2026-07-29T07:32:39.000000Z\", \"tracking_no\": null, \"scrutiny_result\": null}, \"attributes\": {\"status\": \"complete\", \"updated_at\": \"2026-07-29T07:33:52.000000Z\", \"tracking_no\": \"103/26\", \"scrutiny_result\": \"complete\"}}', NULL, '2026-07-29 02:33:52', '2026-07-29 02:33:52'),
(187, 'default', 'created', 'App\\Models\\Verification', 'created', 21, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 21, \"status\": \"assigned\", \"created_at\": \"2026-07-29T07:38:08.000000Z\", \"updated_at\": \"2026-07-29T07:38:08.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-29T07:38:08.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"238\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"normal\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-29 02:38:08', '2026-07-29 02:38:08'),
(188, 'default', 'created', 'App\\Models\\Verification', 'created', 22, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 22, \"status\": \"assigned\", \"created_at\": \"2026-07-29T07:40:12.000000Z\", \"updated_at\": \"2026-07-29T07:40:12.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-07-29T07:40:12.000000Z\", \"assigned_by\": \"12\", \"report_text\": null, \"complaint_id\": \"238\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"normal\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-07-29 02:40:12', '2026-07-29 02:40:12'),
(189, 'default', 'created', 'App\\Models\\Complaint', 'created', 239, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 239, \"cmu\": \"NCCIA - HQ\", \"cnic\": \"78985-7584344-3\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"wiuqhqwdiqqwqd\", \"user_id\": \"12\", \"diary_no\": \"888\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"4864844548\", \"created_at\": \"2026-08-02T11:35:15.000000Z\", \"enquiry_id\": null, \"entry_time\": \"2026-08-02T04:31:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-08-02T11:35:15.000000Z\", \"description\": \"asdsa\", \"operator_id\": null, \"report_date\": \"2026-08-03\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"Telephone\", \"operator_name\": \"Admin\", \"priority_type\": \"normal\", \"received_from\": \"General Public\", \"closure_reason\": null, \"merged_with_id\": null, \"amount_involved\": null, \"occurrence_date\": \"2026-08-03\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"humayunn\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\", \"transfer_to_circle_id\": null, \"transfer_to_department\": null}}', NULL, '2026-08-02 06:35:15', '2026-08-02 06:35:15'),
(190, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 239, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"incomplete\", \"updated_at\": \"2026-08-02T11:35:15.000000Z\", \"tracking_no\": null, \"scrutiny_result\": \"incomplete\", \"operator_remarks\": null}, \"attributes\": {\"status\": \"complete\", \"updated_at\": \"2026-08-02T11:37:27.000000Z\", \"tracking_no\": \"104/26\", \"scrutiny_result\": \"complete\", \"operator_remarks\": \"dadsaaaw\"}}', NULL, '2026-08-02 06:37:27', '2026-08-02 06:37:27'),
(191, 'default', 'created', 'App\\Models\\Verification', 'created', 23, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 23, \"status\": \"assigned\", \"created_at\": \"2026-08-02T11:41:43.000000Z\", \"updated_at\": \"2026-08-02T11:41:43.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-08-02T11:41:43.000000Z\", \"assigned_by\": \"12\", \"report_text\": \"hhadd\", \"complaint_id\": \"239\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"high\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"2\"}}', NULL, '2026-08-02 06:41:43', '2026-08-02 06:41:43'),
(192, 'default', 'created', 'App\\Models\\Complaint', 'created', 240, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 240, \"cmu\": \"NCCIA - HQ\", \"cnic\": \"22222-2222222-2\", \"laws\": [], \"source\": null, \"status\": \"incomplete\", \"address\": \"gujranwala\", \"user_id\": \"12\", \"diary_no\": \"33\", \"evidence\": [], \"circle_id\": null, \"contact_no\": \"3213213232\", \"created_at\": \"2026-08-04T07:29:17.000000Z\", \"enquiry_id\": null, \"entry_time\": \"2026-08-04T12:27:00.000000Z\", \"profession\": null, \"updated_at\": \"2026-08-04T07:29:17.000000Z\", \"description\": \"images blackmail\", \"operator_id\": null, \"report_date\": \"2026-08-04\", \"tracking_no\": null, \"final_status\": null, \"offence_type\": \"cyberstalking\", \"received_via\": \"Telephone\", \"operator_name\": \"Admin\", \"priority_type\": \"high\", \"received_from\": \"General Public\", \"closure_reason\": null, \"merged_with_id\": null, \"amount_involved\": \"20000.00\", \"occurrence_date\": \"2026-07-28\", \"scrutiny_result\": \"incomplete\", \"complainant_name\": \"ali\", \"operator_remarks\": null, \"contact_country_code\": \"+92\", \"operator_designation\": \"admin\", \"transfer_to_circle_id\": null, \"transfer_to_department\": null}}', NULL, '2026-08-04 02:29:17', '2026-08-04 02:29:17'),
(193, 'default', 'updated', 'App\\Models\\Complaint', 'updated', 240, 'App\\Models\\User', 12, '{\"old\": {\"status\": \"incomplete\", \"updated_at\": \"2026-08-04T07:29:17.000000Z\", \"tracking_no\": null, \"scrutiny_result\": \"incomplete\"}, \"attributes\": {\"status\": \"complete\", \"updated_at\": \"2026-08-04T07:29:34.000000Z\", \"tracking_no\": \"105/26\", \"scrutiny_result\": \"complete\"}}', NULL, '2026-08-04 02:29:34', '2026-08-04 02:29:34'),
(194, 'default', 'created', 'App\\Models\\Verification', 'created', 24, 'App\\Models\\User', 12, '{\"attributes\": {\"id\": 24, \"status\": \"assigned\", \"created_at\": \"2026-08-04T07:31:53.000000Z\", \"updated_at\": \"2026-08-04T07:31:53.000000Z\", \"approved_at\": null, \"assigned_at\": \"2026-08-04T07:31:53.000000Z\", \"assigned_by\": \"12\", \"report_text\": \"urgent\", \"complaint_id\": \"240\", \"completed_at\": null, \"submitted_at\": null, \"priority_type\": \"normal\", \"closure_reason\": null, \"recommendation\": null, \"merge_complaint_id\": null, \"transfer_circle_id\": null, \"transfer_department\": null, \"verification_officer_id\": \"23\"}}', NULL, '2026-08-04 02:31:54', '2026-08-04 02:31:54'),
(195, 'default', 'created', 'App\\Models\\Enquiry', 'created', 2, 'App\\Models\\User', 3, '{\"attributes\": {\"id\": 2, \"status\": \"registered\", \"reg_date\": \"2026-08-04\", \"created_at\": \"2026-08-04T08:07:45.000000Z\", \"updated_at\": \"2026-08-04T08:07:45.000000Z\", \"approved_at\": null, \"cfr_summary\": null, \"case_file_id\": null, \"complaint_id\": \"240\", \"submitted_at\": null, \"closure_reason\": null, \"enquiry_number\": \"4444\", \"recommendation\": null, \"assignment_date\": null, \"transfer_circle\": null, \"enquiry_officer_id\": \"4\", \"merge_complaint_id\": null, \"transfer_department\": null}}', NULL, '2026-08-04 03:07:45', '2026-08-04 03:07:45');

-- --------------------------------------------------------

--
-- Table structure for table `arrests`
--

CREATE TABLE `arrests` (
  `id` bigint UNSIGNED NOT NULL,
  `case_id` bigint UNSIGNED NOT NULL,
  `accused_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnic` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `arrest_date` date NOT NULL,
  `remand_details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('nccia-cache-77de68daecd823babbb58edb1c8e14d7106e83bb', 'i:3;', 1785831717),
('nccia-cache-77de68daecd823babbb58edb1c8e14d7106e83bb:timer', 'i:1785831717;', 1785831717),
('nccia-cache-7b52009b64fd0a2a49e6d8a939753077792b0554', 'i:1;', 1785907579),
('nccia-cache-7b52009b64fd0a2a49e6d8a939753077792b0554:timer', 'i:1785907579;', 1785907579),
('nccia-cache-d435a6cdd786300dff204ee7c2ef942d3e9034e2', 'i:3;', 1785831551),
('nccia-cache-d435a6cdd786300dff204ee7c2ef942d3e9034e2:timer', 'i:1785831551;', 1785831551),
('nccia-cache-login:ali@gmail.com|182.180.151.117', 'i:1;', 1785830821),
('nccia-cache-login:ali@gmail.com|182.180.151.117:timer', 'i:1785830821;', 1785830821),
('nccia-cache-login:auhwdhw@gmail.com|182.180.151.117', 'i:3;', 1785670225),
('nccia-cache-login:auhwdhw@gmail.com|182.180.151.117:timer', 'i:1785670225;', 1785670225),
('nccia-cache-login:verification.officer@nccia.gov.pk|182.180.151.117', 'i:2;', 1785914135),
('nccia-cache-login:verification.officer@nccia.gov.pk|182.180.151.117:timer', 'i:1785914135;', 1785914135),
('nccia-cache-login:zillesubhan@gmail.com|182.180.151.117', 'i:3;', 1785828247),
('nccia-cache-login:zillesubhan@gmail.com|182.180.151.117:timer', 'i:1785828247;', 1785828247),
('nccia-cache-spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:14:{i:0;a:4:{s:1:\"a\";s:1:\"1\";s:1:\"b\";s:9:\"dashboard\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:12:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:8;i:8;i:9;i:9;i:10;i:10;i:11;i:11;i:12;}}i:1;a:4:{s:1:\"a\";s:1:\"2\";s:1:\"b\";s:9:\"analytics\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:6;i:3;i:11;i:4;i:12;}}i:2;a:4:{s:1:\"a\";s:1:\"3\";s:1:\"b\";s:10:\"complaints\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:3;i:2;i:6;i:3;i:7;i:4;i:11;i:5;i:12;}}i:3;a:4:{s:1:\"a\";s:1:\"4\";s:1:\"b\";s:13:\"verifications\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:5;i:4;i:11;i:5;i:12;}}i:4;a:4:{s:1:\"a\";s:1:\"5\";s:1:\"b\";s:7:\"reports\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:5;i:4;i:11;i:5;i:12;}}i:5;a:4:{s:1:\"a\";s:1:\"6\";s:1:\"b\";s:9:\"enquiries\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:12:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:8;i:8;i:9;i:9;i:10;i:10;i:11;i:11;i:12;}}i:6;a:4:{s:1:\"a\";s:1:\"7\";s:1:\"b\";s:10:\"io_records\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:11;i:3;i:12;}}i:7;a:4:{s:1:\"a\";s:1:\"8\";s:1:\"b\";s:9:\"dac_cases\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:10:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:5;i:4;i:6;i:5;i:8;i:6;i:9;i:7;i:10;i:8;i:11;i:9;i:12;}}i:8;a:4:{s:1:\"a\";s:1:\"9\";s:1:\"b\";s:11:\"court_cases\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:6;i:3;i:11;i:4;i:12;}}i:9;a:4:{s:1:\"a\";s:2:\"10\";s:1:\"b\";s:5:\"users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:11;i:1;i:12;}}i:10;a:4:{s:1:\"a\";s:2:\"11\";s:1:\"b\";s:7:\"circles\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:11;i:1;i:12;}}i:11;a:4:{s:1:\"a\";s:2:\"12\";s:1:\"b\";s:13:\"offence_types\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:6;i:3;i:11;i:4;i:12;}}i:12;a:4:{s:1:\"a\";s:2:\"13\";s:1:\"b\";s:9:\"reference\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:6;i:3;i:11;i:4;i:12;}}i:13;a:4:{s:1:\"a\";s:2:\"14\";s:1:\"b\";s:7:\"profile\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:12:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:8;i:8;i:9;i:9;i:10;i:10;i:11;i:11;i:12;}}}s:5:\"roles\";a:12:{i:0;a:3:{s:1:\"a\";s:1:\"1\";s:1:\"b\";s:8:\"operator\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";s:1:\"2\";s:1:\"b\";s:20:\"verification_officer\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";s:1:\"3\";s:1:\"b\";s:15:\"circle_incharge\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";s:1:\"4\";s:1:\"b\";s:15:\"enquiry_officer\";s:1:\"c\";s:3:\"web\";}i:4;a:3:{s:1:\"a\";s:1:\"5\";s:1:\"b\";s:21:\"investigation_officer\";s:1:\"c\";s:3:\"web\";}i:5;a:3:{s:1:\"a\";s:1:\"6\";s:1:\"b\";s:8:\"moharrar\";s:1:\"c\";s:3:\"web\";}i:6;a:3:{s:1:\"a\";s:1:\"7\";s:1:\"b\";s:13:\"reader_branch\";s:1:\"c\";s:3:\"web\";}i:7;a:3:{s:1:\"a\";s:1:\"8\";s:1:\"b\";s:8:\"ad_legal\";s:1:\"c\";s:3:\"web\";}i:8;a:3:{s:1:\"a\";s:1:\"9\";s:1:\"b\";s:8:\"dd_legal\";s:1:\"c\";s:3:\"web\";}i:9;a:3:{s:1:\"a\";s:2:\"10\";s:1:\"b\";s:19:\"additional_director\";s:1:\"c\";s:3:\"web\";}i:10;a:3:{s:1:\"a\";s:2:\"11\";s:1:\"b\";s:16:\"director_general\";s:1:\"c\";s:3:\"web\";}i:11;a:3:{s:1:\"a\";s:2:\"12\";s:1:\"b\";s:5:\"admin\";s:1:\"c\";s:3:\"web\";}}}', 1785917309);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cases`
--

CREATE TABLE `cases` (
  `id` bigint UNSIGNED NOT NULL,
  `enquiry_id` bigint UNSIGNED NOT NULL,
  `fir_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `investigation_officer_id` bigint UNSIGNED DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registered',
  `recommendation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_circle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `merge_complaint_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cases`
--

INSERT INTO `cases` (`id`, `enquiry_id`, `fir_no`, `investigation_officer_id`, `status`, `recommendation`, `transfer_department`, `transfer_circle`, `merge_complaint_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'CCW-F-1/26', 15, 'registered', NULL, NULL, NULL, NULL, '2026-07-28 00:00:16', '2026-07-28 00:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `case_activities`
--

CREATE TABLE `case_activities` (
  `id` bigint UNSIGNED NOT NULL,
  `case_id` bigint UNSIGNED NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_date` date NOT NULL,
  `attachment_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `case_approvals`
--

CREATE TABLE `case_approvals` (
  `id` bigint UNSIGNED NOT NULL,
  `case_id` bigint UNSIGNED NOT NULL,
  `circle_incharge_id` bigint UNSIGNED NOT NULL,
  `decision` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `case_legal_opinions`
--

CREATE TABLE `case_legal_opinions` (
  `id` bigint UNSIGNED NOT NULL,
  `case_id` bigint UNSIGNED NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opinion_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `decision` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `circles`
--

CREATE TABLE `circles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zone_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `circles`
--

INSERT INTO `circles` (`id`, `name`, `code`, `zone_id`, `created_at`, `updated_at`) VALUES
(1, 'Islamabad Circle', 'ISB', 1, '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(2, 'Lahore Circle', 'LHR', 1, '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(3, 'Karachi Circle', 'KHI', 2, '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(4, 'Quetta Circle', 'UET', 2, '2026-07-17 05:48:16', '2026-07-17 05:48:16');

-- --------------------------------------------------------

--
-- Table structure for table `cmu_options`
--

CREATE TABLE `cmu_options` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cmu_options`
--

INSERT INTO `cmu_options` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'NCCIA - HQs', NULL, NULL),
(2, 'Zonal Directorate - Lahore', NULL, NULL),
(3, 'Zonal Directorate - Karachi', NULL, NULL),
(4, 'Zonal Directorate - Islamabad', NULL, NULL),
(5, 'CCRC - LHR', NULL, NULL),
(6, 'CCRC - KHI', NULL, NULL),
(7, 'CCRC - ISB', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint UNSIGNED NOT NULL,
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complainant_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnic` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_country_code` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT '+92',
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `profession` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_date` date NOT NULL,
  `diary_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `received_via` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `received_from` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cmu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'regular',
  `offence_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_involved` decimal(14,2) DEFAULT NULL,
  `occurrence_date` date NOT NULL,
  `laws` json DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidence` json DEFAULT NULL,
  `operator_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `operator_designation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_time` datetime NOT NULL,
  `scrutiny_result` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operator_remarks` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'incomplete',
  `final_status` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `closure_reason` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `operator_id` bigint UNSIGNED DEFAULT NULL,
  `circle_id` bigint UNSIGNED DEFAULT NULL,
  `merged_with_id` bigint UNSIGNED DEFAULT NULL,
  `transfer_to_department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_to_circle_id` bigint UNSIGNED DEFAULT NULL,
  `enquiry_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `source`, `tracking_no`, `complainant_name`, `cnic`, `contact_no`, `contact_country_code`, `address`, `profession`, `report_date`, `diary_no`, `received_via`, `received_from`, `cmu`, `priority_type`, `offence_type`, `amount_involved`, `occurrence_date`, `laws`, `description`, `evidence`, `operator_name`, `operator_designation`, `entry_time`, `scrutiny_result`, `operator_remarks`, `status`, `final_status`, `closure_reason`, `user_id`, `created_at`, `updated_at`, `operator_id`, `circle_id`, `merged_with_id`, `transfer_to_department`, `transfer_to_circle_id`, `enquiry_id`) VALUES
(1, NULL, NULL, 'Ahmad Hassan', '76545-7106589-7', '030-5940037', '+92', '959, Gulberg, Lahore', 'Private Sector', '2026-05-12', 'LHR-D-6369/26', 'Telephone', 'Bank', 'CCRC - LHR', 'regular', 'extortion', 1922944.00, '2026-07-14', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Ahmad Hassan. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 14:56:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 9, '2026-05-10 05:48:19', '2026-07-17 05:48:19', 4, 2, NULL, NULL, NULL, NULL),
(2, NULL, NULL, 'Muhammad Ali', '14157-6680243-8', '034-4056578', '+92', '748, Model Town, Karachi', 'Lawyer', '2026-05-31', 'LHR-D-4647/26', 'Postal Service', 'PM Office', 'NCCIA - HQs', 'court', 'malware', 1894828.00, '2026-07-07', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Muhammad Ali. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 12:49:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 4, '2026-06-13 05:48:19', '2026-07-17 05:48:19', 4, 1, NULL, NULL, NULL, NULL),
(3, NULL, NULL, 'Fatima Zahra', '14567-7638525-4', '034-9520760', '+92', '984, Gulberg, Quetta', 'Bank Employee', '2026-04-20', 'LHR-D-4542/26', 'Email', 'PM Office', 'CCRC - ISB', 'regular', 'malware', 4183945.00, '2026-03-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Fatima Zahra. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-03 11:00:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 7, '2026-05-07 05:48:19', '2026-07-17 05:48:19', 1, 3, NULL, NULL, NULL, NULL),
(4, NULL, NULL, 'Omar Farooq', '57104-1339038-6', '031-4352642', '+92', '713, Garden Town, Lahore', 'Teacher', '2026-05-07', 'LHR-D-5429/26', 'Telephone', 'General Public', 'NCCIA - HQs', 'court', 'extortion', 4564469.00, '2026-02-08', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Omar Farooq. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-11 12:44:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 12, '2026-06-04 05:48:19', '2026-07-17 05:48:19', 11, 4, NULL, NULL, NULL, NULL),
(5, NULL, 'KHI-C-0005/26', 'Ayesha Bibi', '39686-9109630-4', '035-4280723', '+92', '308, Model Town, Quetta', 'Business Owner', '2026-05-11', 'LHR-D-9664/26', 'Postal Service', 'Organization', 'CCRC - ISB', 'regular', 'anti_state', NULL, '2026-07-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Ayesha Bibi. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-02 13:15:00', 'complete', NULL, 'complete', NULL, NULL, 9, '2026-06-11 05:48:19', '2026-07-17 05:48:19', 6, 3, NULL, NULL, NULL, NULL),
(6, NULL, 'ISB-C-0006/26', 'Bilal Ahmed', '99053-4159529-5', '038-1142080', '+92', '157, Garden Town, Quetta', 'Business Owner', '2026-06-23', 'LHR-D-4591/26', 'Walk-in', 'Anonymous', 'CCRC - KHI', 'anti_state', 'data_breach', 2767508.00, '2026-07-12', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Bilal Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-30 16:58:00', 'complete', NULL, 'complete', NULL, NULL, 1, '2026-05-11 05:48:19', '2026-07-17 05:48:19', 11, 1, NULL, NULL, NULL, NULL),
(7, NULL, NULL, 'Sana Tariq', '18050-4105147-3', '034-4615136', '+92', '665, Defence, Lahore', 'Student', '2026-04-28', 'LHR-D-5619/26', 'Telephone', 'Ministry', 'CCRC - KHI', 'higher_authority', 'online_scam', NULL, '2026-06-25', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Sana Tariq. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-12 14:58:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 4, '2026-05-18 05:48:19', '2026-07-17 05:48:19', 1, 2, NULL, NULL, NULL, NULL),
(8, NULL, NULL, 'Kamran Iqbal', '54843-3948213-3', '030-3873123', '+92', '238, Defence, Karachi', 'Lawyer', '2026-06-30', 'LHR-D-6604/26', 'Postal Service', 'Anonymous', 'CCRC - KHI', 'anti_state', 'impersonation', 3451192.00, '2026-04-17', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Kamran Iqbal. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-13 13:49:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 6, '2026-07-03 05:48:19', '2026-07-17 05:48:19', 1, 1, NULL, NULL, NULL, NULL),
(9, NULL, NULL, 'Zainab Noor', '45966-3888142-6', '039-9892216', '+92', '215, Garden Town, Islamabad', 'Private Sector', '2026-06-27', 'LHR-D-9076/26', 'Tipline', 'Ministry', 'NCCIA - HQs', 'court', 'extortion', 2428517.00, '2026-05-23', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Zainab Noor. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-16 12:31:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 3, '2026-06-23 05:48:19', '2026-07-17 05:48:19', 4, 1, NULL, NULL, NULL, NULL),
(10, NULL, NULL, 'Tariq Mahmood', '81125-7933956-5', '037-8022796', '+92', '513, Defence, Islamabad', 'Government Employee', '2026-04-27', 'LHR-D-0274/26', 'Walk-in', 'Court', 'CCRC - LHR', 'higher_authority', 'impersonation', 1950334.00, '2026-06-26', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Tariq Mahmood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-23 12:14:00', 'invalid', NULL, 'invalid', NULL, NULL, 10, '2026-05-26 05:48:19', '2026-07-17 05:48:19', 8, 4, NULL, NULL, NULL, NULL),
(11, NULL, 'UET-C-0011/26', 'Nadia Hussain', '27284-9843001-2', '031-3376890', '+92', '164, Defence, Quetta', 'Private Sector', '2026-06-12', 'LHR-D-2190/26', 'Email', 'PM Office', 'NCCIA - HQs', 'anti_state', 'hate_speech', NULL, '2026-04-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Nadia Hussain. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-13 09:56:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 2, '2026-05-22 05:48:19', '2026-07-17 05:48:19', 3, 4, NULL, NULL, NULL, NULL),
(12, NULL, 'UET-1/26', 'Imran Khan', '57497-7615527-5', '309190876', '+92', '547, Model Town, Islamabad', 'Lawyer', '2026-06-10', 'LHR-D-6797/26', 'Telephone', 'Bank', 'CCRC - LHR', 'regular', 'online_fraud', NULL, '2026-05-10', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Imran Khan. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 11:34:00', 'incomplete', NULL, 'complete', NULL, NULL, 3, '2026-07-15 05:48:19', '2026-07-25 23:52:07', 4, 4, NULL, NULL, NULL, NULL),
(13, NULL, NULL, 'Sadia Bhatti', '76958-5516017-8', '033-1672206', '+92', '235, Garden Town, Islamabad', 'Student', '2026-06-01', 'LHR-D-6383/26', 'Postal Service', 'Organization', 'CCRC - LHR', 'court', 'cyberstalking', 264467.00, '2026-04-28', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Sadia Bhatti. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-29 10:19:00', 'invalid', 'Initial review completed. Case requires verification.', 'invalid', NULL, NULL, 7, '2026-05-18 05:48:19', '2026-07-17 05:48:19', 5, 1, NULL, NULL, NULL, NULL),
(14, NULL, NULL, 'Faisal Rafiq', '86068-2009690-1', '033-5580827', '+92', '858, Gulberg, Quetta', 'Student', '2026-07-13', 'LHR-D-6401/26', 'Email', 'Organization', 'CCRC - LHR', 'higher_authority', 'impersonation', NULL, '2026-04-12', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Faisal Rafiq. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 09:31:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 11, '2026-07-10 05:48:19', '2026-07-17 05:48:19', 8, 4, NULL, NULL, NULL, NULL),
(15, NULL, NULL, 'Rabia Anjum', '97154-4400244-8', '034-7781840', '+92', '152, Defence, Karachi', 'Retired', '2026-05-17', 'LHR-D-4987/26', 'Telephone', 'Anonymous', 'CCRC - KHI', 'regular', 'harassment', 2244167.00, '2026-05-28', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Rabia Anjum. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-28 16:49:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 5, '2026-05-01 05:48:19', '2026-07-17 05:48:19', 6, 3, NULL, NULL, NULL, NULL),
(16, NULL, NULL, 'Usman Ghani', '91042-4046911-4', '030-8765567', '+92', '888, Gulberg, Islamabad', 'Student', '2026-07-15', 'LHR-D-4875/26', 'Tipline', 'Organization', 'CCRC - LHR', 'anti_state', 'anti_state', 173180.00, '2026-02-04', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Usman Ghani. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-14 11:43:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 11, '2026-07-05 05:48:19', '2026-07-17 05:48:19', 10, 4, NULL, NULL, NULL, NULL),
(17, NULL, 'KHI-C-0017/26', 'Hina Tariq', '83075-4264646-1', '033-2822996', '+92', '584, Gulberg, Peshawar', 'Teacher', '2026-06-13', 'LHR-D-6320/26', 'Online Portal', 'Bank', 'NCCIA - HQs', 'court', 'crypto_fraud', 908924.00, '2026-02-02', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Hina Tariq. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-03 12:53:00', 'complete', NULL, 'complete', NULL, NULL, 9, '2026-07-05 05:48:19', '2026-07-17 05:48:19', 5, 3, NULL, NULL, NULL, NULL),
(18, NULL, NULL, 'Javed Ashraf', '96796-8706834-9', '030-9787630', '+92', '299, Main Blvd, Karachi', 'Retired', '2026-06-19', 'LHR-D-0811/26', 'Telephone', 'Anonymous', 'CCRC - LHR', 'court', 'anti_state', 3176873.00, '2026-03-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Javed Ashraf. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-10 13:17:00', 'invalid', NULL, 'invalid', NULL, NULL, 5, '2026-04-22 05:48:19', '2026-07-17 05:48:19', 9, 3, NULL, NULL, NULL, NULL),
(19, NULL, NULL, 'Saima Akram', '56849-9176471-3', '037-7235704', '+92', '954, Model Town, Karachi', 'Business Owner', '2026-05-28', 'LHR-D-2448/26', 'Walk-in', 'Anonymous', 'CCRC - KHI', 'anti_state', 'financial_fraud', 941906.00, '2026-01-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Saima Akram. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-12 09:13:00', 'invalid', NULL, 'invalid', NULL, NULL, 10, '2026-05-04 05:48:19', '2026-07-17 05:48:19', 1, 2, NULL, NULL, NULL, NULL),
(20, NULL, NULL, 'Khalid Mehmood', '41808-4682257-9', '039-7121642', '+92', '649, Model Town, Quetta', 'Teacher', '2026-05-15', 'LHR-D-8703/26', 'Tipline', 'PM Office', 'CCRC - ISB', 'regular', 'malware', 1581101.00, '2026-05-18', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Khalid Mehmood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-26 12:04:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 3, '2026-04-18 05:48:19', '2026-07-17 05:48:19', 1, 2, NULL, NULL, NULL, NULL),
(21, NULL, NULL, 'Amna Saeed', '97651-6686424-4', '034-1729653', '+92', '520, Main Blvd, Quetta', 'Lawyer', '2026-07-16', 'LHR-D-1130/26', 'Walk-in', 'Organization', 'NCCIA - HQs', 'court', 'defamation', 4840164.00, '2026-06-02', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Amna Saeed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-19 16:22:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 9, '2026-07-11 05:48:19', '2026-07-17 05:48:19', 10, 2, NULL, NULL, NULL, NULL),
(22, NULL, 'ISB-C-0022/26', 'Naveed Ahmad', '43757-1896804-1', '033-2977475', '+92', '511, Garden Town, Lahore', 'Bank Employee', '2026-06-25', 'LHR-D-3472/26', 'Email', 'Ministry', 'CCRC - LHR', 'anti_state', 'impersonation', 1759107.00, '2026-01-28', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Naveed Ahmad. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-08 17:06:00', 'complete', NULL, 'complete', NULL, NULL, 1, '2026-05-19 05:48:19', '2026-07-17 05:48:19', 1, 1, NULL, NULL, NULL, NULL),
(23, NULL, NULL, 'Rubina Shaheen', '32721-6658695-6', '035-5670408', '+92', '584, Garden Town, Peshawar', 'Lawyer', '2026-05-11', 'LHR-D-4731/26', 'Walk-in', 'General Public', 'NCCIA - HQs', 'higher_authority', 'malware', 25516.00, '2026-05-20', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Rubina Shaheen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 13:51:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 5, '2026-05-17 05:48:19', '2026-07-17 05:48:19', 1, 4, NULL, NULL, NULL, NULL),
(24, NULL, NULL, 'Asif Raza', '26794-3964272-2', '031-5333925', '+92', '984, Model Town, Lahore', 'Lawyer', '2026-05-26', 'LHR-D-4397/26', 'Online Portal', 'Organization', 'CCRC - LHR', 'higher_authority', 'cyberstalking', 1951029.00, '2026-06-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Asif Raza. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 12:43:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 8, '2026-06-17 05:48:19', '2026-07-17 05:48:19', 12, 2, NULL, NULL, NULL, NULL),
(25, NULL, NULL, 'Tahira Bibi', '80662-7723371-5', '038-5573140', '+92', '344, Garden Town, Islamabad', 'Government Employee', '2026-05-31', 'LHR-D-9814/26', 'Walk-in', 'Bank', 'CCRC - LHR', 'court', 'data_breach', 3506285.00, '2026-01-28', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Tahira Bibi. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-17 14:06:00', 'invalid', NULL, 'invalid', NULL, NULL, 2, '2026-04-21 05:48:19', '2026-07-17 05:48:19', 4, 4, NULL, NULL, NULL, NULL),
(26, NULL, 'ISB-C-0026/26', 'Shahid Ali', '18052-5523837-7', '034-8284852', '+92', '383, Model Town, Peshawar', 'Lawyer', '2026-05-14', 'LHR-D-4720/26', 'Telephone', 'General Public', 'CCRC - KHI', 'regular', 'hate_speech', 4383142.00, '2026-05-17', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Shahid Ali. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-14 13:06:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 8, '2026-07-06 05:48:19', '2026-07-17 05:48:19', 5, 1, NULL, NULL, NULL, NULL),
(27, NULL, NULL, 'Nargis Fatima', '46695-6561160-5', '037-2737087', '+92', '598, Gulberg, Karachi', 'Student', '2026-07-12', 'LHR-D-2780/26', 'Telephone', 'Court', 'CCRC - LHR', 'regular', 'harassment', 2259541.00, '2026-07-10', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Nargis Fatima. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-11 10:11:00', 'invalid', NULL, 'invalid', NULL, NULL, 8, '2026-06-09 05:48:19', '2026-07-17 05:48:19', 3, 4, NULL, NULL, NULL, NULL),
(28, NULL, NULL, 'Irfan Ullah', '92820-7682520-1', '038-5396971', '+92', '225, Main Blvd, Islamabad', 'Bank Employee', '2026-06-12', 'LHR-D-4404/26', 'Walk-in', 'Bank', 'NCCIA - HQs', 'anti_state', 'hacking', NULL, '2026-02-28', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Irfan Ullah. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-30 15:15:00', 'invalid', 'Initial review completed. Case requires verification.', 'invalid', NULL, NULL, 7, '2026-06-11 05:48:19', '2026-07-17 05:48:19', 8, 3, NULL, NULL, NULL, NULL),
(29, NULL, NULL, 'Kiran Masood', '25953-8971148-3', '031-2227463', '+92', '95, Main Blvd, Lahore', 'Bank Employee', '2026-05-15', 'LHR-D-9178/26', 'Email', 'Anonymous', 'CCRC - KHI', 'court', 'financial_fraud', 4018527.00, '2026-03-29', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Kiran Masood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-02 11:04:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 6, '2026-04-25 05:48:19', '2026-07-17 05:48:19', 3, 4, NULL, NULL, NULL, NULL),
(30, NULL, NULL, 'Rashid Minhas', '75914-3859033-8', '034-5217546', '+92', '775, Model Town, Quetta', 'Business Owner', '2026-06-12', 'LHR-D-3322/26', 'Walk-in', 'Court', 'NCCIA - HQs', 'anti_state', 'hate_speech', 1947231.00, '2026-05-29', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Rashid Minhas. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-11 17:48:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 5, '2026-04-19 05:48:19', '2026-07-17 05:48:19', 1, 2, NULL, NULL, NULL, NULL),
(31, NULL, NULL, 'Samina Yasmin', '64147-1960375-2', '039-7005050', '+92', '54, Gulberg, Islamabad', 'Government Employee', '2026-07-07', 'LHR-D-9517/26', 'Postal Service', 'Anonymous', 'CCRC - KHI', 'anti_state', 'defamation', 159381.00, '2026-05-21', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Samina Yasmin. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-26 12:20:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 12, '2026-05-19 05:48:19', '2026-07-17 05:48:19', 7, 2, NULL, NULL, NULL, NULL),
(32, NULL, NULL, 'Farhan Akhtar', '33283-7059844-3', '030-9526563', '+92', '184, Model Town, Lahore', 'Retired', '2026-05-20', 'LHR-D-9321/26', 'Postal Service', 'Court', 'NCCIA - HQs', 'higher_authority', 'harassment', 2507119.00, '2026-03-28', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Farhan Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-05 16:52:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 6, '2026-05-25 05:48:19', '2026-07-17 05:48:19', 4, 1, NULL, NULL, NULL, NULL),
(33, NULL, NULL, 'Nasreen Javed', '30007-9952748-9', '031-1922323', '+92', '357, Garden Town, Peshawar', 'Student', '2026-05-05', 'LHR-D-4518/26', 'Postal Service', 'Ministry', 'CCRC - LHR', 'anti_state', 'harassment', 4434353.00, '2026-02-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Nasreen Javed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-13 13:56:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 4, '2026-04-24 05:48:19', '2026-07-17 05:48:19', 1, 3, NULL, NULL, NULL, NULL),
(34, NULL, NULL, 'Waqar Ahmed', '45668-1382910-5', '032-4914427', '+92', '410, Garden Town, Islamabad', 'Bank Employee', '2026-07-09', 'LHR-D-2085/26', 'Walk-in', 'Organization', 'CCRC - KHI', 'regular', 'crypto_fraud', 375308.00, '2026-06-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Waqar Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-27 10:07:00', 'invalid', 'Initial review completed. Case requires verification.', 'invalid', NULL, NULL, 2, '2026-06-09 05:48:19', '2026-07-17 05:48:19', 10, 4, NULL, NULL, NULL, NULL),
(35, NULL, 'KHI-C-0035/26', 'Shabnam Kiran', '54934-7333369-9', '032-5112200', '+92', '365, Garden Town, Peshawar', 'Private Sector', '2026-06-24', 'LHR-D-1286/26', 'Walk-in', 'Bank', 'CCRC - LHR', 'anti_state', 'anti_state', 445675.00, '2026-05-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Shabnam Kiran. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-26 11:14:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 1, '2026-07-13 05:48:19', '2026-07-17 05:48:19', 2, 3, NULL, NULL, NULL, NULL),
(36, NULL, 'UET-C-0036/26', 'Adnan Rashid', '40929-3394213-9', '035-9229036', '+92', '383, Main Blvd, Quetta', 'Government Employee', '2026-06-15', 'LHR-D-1806/26', 'Telephone', 'PM Office', 'CCRC - ISB', 'higher_authority', 'cyberstalking', NULL, '2026-04-22', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Adnan Rashid. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-21 13:40:00', 'complete', NULL, 'complete', NULL, NULL, 1, '2026-05-26 05:48:19', '2026-07-17 05:48:19', 9, 4, NULL, NULL, NULL, NULL),
(37, NULL, NULL, 'Shazia Zafar', '68166-2125689-7', '031-6916761', '+92', '77, Model Town, Quetta', 'Retired', '2026-05-04', 'LHR-D-0453/26', 'Walk-in', 'Anonymous', 'NCCIA - HQs', 'regular', 'online_scam', 2193276.00, '2026-01-19', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Shazia Zafar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-30 09:10:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 10, '2026-05-23 05:48:19', '2026-07-17 05:48:19', 2, 3, NULL, NULL, NULL, NULL),
(38, NULL, 'UET-C-0038/26', 'Junaid Iqbal', '45951-6109594-9', '038-8330192', '+92', '191, Model Town, Karachi', 'Lawyer', '2026-04-19', 'LHR-D-3087/26', 'Walk-in', 'Bank', 'CCRC - KHI', 'anti_state', 'impersonation', 3469370.00, '2026-06-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Junaid Iqbal. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-28 16:37:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 3, '2026-06-25 05:48:19', '2026-07-17 05:48:19', 1, 4, NULL, NULL, NULL, NULL),
(39, NULL, NULL, 'Najma Sultana', '33321-8625548-5', '031-5995931', '+92', '333, Garden Town, Karachi', 'Private Sector', '2026-06-18', 'LHR-D-1265/26', 'Tipline', 'Court', 'NCCIA - HQs', 'regular', 'harassment', 200567.00, '2026-05-10', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Najma Sultana. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-02 17:21:00', 'invalid', NULL, 'invalid', NULL, NULL, 5, '2026-06-17 05:48:19', '2026-07-17 05:48:19', 5, 1, NULL, NULL, NULL, NULL),
(40, NULL, NULL, 'Sohail Ahmed', '84865-8655024-6', '038-7985498', '+92', '393, Gulberg, Islamabad', 'Student', '2026-04-27', 'LHR-D-8801/26', 'Walk-in', 'Bank', 'CCRC - KHI', 'anti_state', 'financial_fraud', 4366036.00, '2026-05-09', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Sohail Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-06 11:28:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 4, '2026-05-13 05:48:19', '2026-07-17 05:48:19', 10, 3, NULL, NULL, NULL, NULL),
(41, NULL, NULL, 'Parveen Akhtar', '49780-7347271-1', '033-6267599', '+92', '432, Model Town, Karachi', 'Bank Employee', '2026-05-06', 'LHR-D-7840/26', 'Telephone', 'Ministry', 'CCRC - KHI', 'anti_state', 'extortion', NULL, '2026-04-11', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Parveen Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-22 10:45:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 8, '2026-05-22 05:48:19', '2026-07-17 05:48:19', 5, 1, NULL, NULL, NULL, NULL),
(42, NULL, NULL, 'Tanveer Hussain', '58202-8285298-5', '037-7561321', '+92', '13, Garden Town, Islamabad', 'Lawyer', '2026-05-09', 'LHR-D-6432/26', 'Email', 'PM Office', 'CCRC - KHI', 'anti_state', 'data_breach', 1865828.00, '2026-05-08', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Tanveer Hussain. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 14:03:00', 'invalid', 'Initial review completed. Case requires verification.', 'invalid', NULL, NULL, 5, '2026-06-30 05:48:20', '2026-07-17 05:48:20', 4, 3, NULL, NULL, NULL, NULL),
(43, NULL, 'LHR-C-0043/26', 'Shamim Bano', '50365-1822271-5', '030-4769377', '+92', '34, Main Blvd, Peshawar', 'Private Sector', '2026-07-16', 'LHR-D-1128/26', 'Telephone', 'Ministry', 'CCRC - KHI', 'higher_authority', 'data_breach', 3620992.00, '2026-01-26', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Shamim Bano. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-19 14:35:00', 'complete', NULL, 'complete', NULL, NULL, 8, '2026-06-08 05:48:20', '2026-07-17 05:48:20', 11, 2, NULL, NULL, NULL, NULL),
(44, NULL, NULL, 'Kashif Ali', '92735-9346258-2', '033-2342307', '+92', '931, Model Town, Lahore', 'Bank Employee', '2026-06-09', 'LHR-D-5837/26', 'Telephone', 'Bank', 'CCRC - LHR', 'anti_state', 'hacking', NULL, '2026-03-29', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Kashif Ali. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-06 14:09:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 7, '2026-05-31 05:48:20', '2026-07-17 05:48:20', 6, 2, NULL, NULL, NULL, NULL),
(45, NULL, NULL, 'Nasim Jahan', '10053-3087221-6', '031-1561959', '+92', '438, Defence, Karachi', 'Lawyer', '2026-04-20', 'LHR-D-4556/26', 'Tipline', 'Court', 'CCRC - ISB', 'anti_state', 'hacking', 61419.00, '2026-04-05', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Nasim Jahan. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-08 13:19:00', 'invalid', NULL, 'invalid', NULL, NULL, 11, '2026-07-04 05:48:20', '2026-07-17 05:48:20', 5, 4, NULL, NULL, NULL, NULL),
(46, NULL, NULL, 'Rizwan Asghar', '33997-4071049-3', '032-3545903', '+92', '269, Main Blvd, Peshawar', 'Government Employee', '2026-07-08', 'LHR-D-1334/26', 'Tipline', 'PM Office', 'CCRC - KHI', 'court', 'malware', 442623.00, '2026-05-18', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Rizwan Asghar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-07 12:17:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 2, '2026-07-16 05:48:20', '2026-07-17 05:48:20', 2, 1, NULL, NULL, NULL, NULL),
(47, NULL, 'ISB-C-0047/26', 'Shahnaz Begum', '29876-5875103-6', '037-5076227', '+92', '888, Main Blvd, Peshawar', 'Lawyer', '2026-04-21', 'LHR-D-5391/26', 'Telephone', 'Organization', 'CCRC - ISB', 'higher_authority', 'online_scam', 4709257.00, '2026-02-25', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Shahnaz Begum. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 14:26:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 7, '2026-04-20 05:48:20', '2026-07-17 05:48:20', 5, 1, NULL, NULL, NULL, NULL),
(48, NULL, NULL, 'Mudassar Ali', '18656-5578956-5', '030-4532398', '+92', '259, Garden Town, Peshawar', 'Retired', '2026-05-04', 'LHR-D-1244/26', 'Tipline', 'Bank', 'CCRC - ISB', 'higher_authority', 'data_breach', NULL, '2026-04-09', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Mudassar Ali. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-21 10:59:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 7, '2026-04-29 05:48:20', '2026-07-17 05:48:20', 3, 3, NULL, NULL, NULL, NULL),
(49, NULL, 'UET-C-0049/26', 'Zubaida Khatoon', '15296-6105268-4', '031-7125425', '+92', '374, Defence, Islamabad', 'Business Owner', '2026-07-08', 'LHR-D-2048/26', 'Online Portal', 'Anonymous', 'CCRC - ISB', 'regular', 'hacking', NULL, '2026-04-13', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Zubaida Khatoon. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-17 13:31:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 5, '2026-07-04 05:48:20', '2026-07-17 05:48:20', 10, 4, NULL, NULL, NULL, NULL),
(50, NULL, NULL, 'Naeem Akhtar', '13328-8501606-5', '039-3980583', '+92', '443, Garden Town, Quetta', 'Business Owner', '2026-06-24', 'LHR-D-2620/26', 'Telephone', 'Court', 'CCRC - ISB', 'anti_state', 'extortion', NULL, '2026-06-09', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Naeem Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-05 15:06:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 1, '2026-06-19 05:48:20', '2026-07-17 05:48:20', 12, 1, NULL, NULL, NULL, NULL),
(51, NULL, 'LHR-C-0051/26', 'Ashraf Hussain', '67831-8755220-6', '034-8979455', '+92', '802, Model Town, Islamabad', 'Business Owner', '2026-06-27', 'LHR-D-4490/26', 'Walk-in', 'General Public', 'CCRC - KHI', 'regular', 'cyberstalking', 3192710.00, '2026-03-06', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Ashraf Hussain. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-01 16:15:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 6, '2026-05-19 05:48:20', '2026-07-17 05:48:20', 2, 2, NULL, NULL, NULL, NULL),
(52, NULL, NULL, 'Shakeel Ahmed', '92873-6134752-8', '033-1896913', '+92', '442, Gulberg, Lahore', 'Bank Employee', '2026-04-28', 'LHR-D-6253/26', 'Tipline', 'Bank', 'CCRC - ISB', 'anti_state', 'harassment', 2396281.00, '2026-06-22', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Shakeel Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-02 09:23:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 2, '2026-06-10 05:48:20', '2026-07-17 05:48:20', 12, 3, NULL, NULL, NULL, NULL),
(53, NULL, NULL, 'Rukhsana Parveen', '68224-7668730-6', '038-3510628', '+92', '675, Garden Town, Karachi', 'Government Employee', '2026-07-11', 'LHR-D-9187/26', 'Telephone', 'Organization', 'CCRC - ISB', 'court', 'anti_state', NULL, '2026-02-04', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Rukhsana Parveen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 14:23:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 3, '2026-05-01 05:48:20', '2026-07-17 05:48:20', 2, 2, NULL, NULL, NULL, NULL),
(54, NULL, NULL, 'Masood Ahmed', '91488-6834867-1', '032-3114533', '+92', '124, Model Town, Karachi', 'Teacher', '2026-05-24', 'LHR-D-0065/26', 'Email', 'Ministry', 'CCRC - ISB', 'anti_state', 'financial_fraud', 4018548.00, '2026-03-30', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Masood Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-21 13:56:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 11, '2026-06-20 05:48:20', '2026-07-17 05:48:20', 10, 4, NULL, NULL, NULL, NULL),
(55, NULL, NULL, 'Zahida Perveen', '75828-6122062-4', '032-2722973', '+92', '709, Model Town, Peshawar', 'Business Owner', '2026-05-23', 'LHR-D-0893/26', 'Online Portal', 'Anonymous', 'NCCIA - HQs', 'anti_state', 'data_breach', 3007738.00, '2026-04-10', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Zahida Perveen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-02 15:22:00', 'invalid', 'Initial review completed. Case requires verification.', 'invalid', NULL, NULL, 4, '2026-05-08 05:48:20', '2026-07-17 05:48:20', 2, 3, NULL, NULL, NULL, NULL),
(56, NULL, 'UET-C-0056/26', 'Nadeem Asghar', '81801-8085358-4', '037-2539917', '+92', '324, Model Town, Islamabad', 'Retired', '2026-05-22', 'LHR-D-3904/26', 'Walk-in', 'Ministry', 'NCCIA - HQs', 'higher_authority', 'online_scam', 1664277.00, '2026-02-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Nadeem Asghar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-21 14:04:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 12, '2026-06-15 05:48:20', '2026-07-17 05:48:20', 4, 4, NULL, NULL, NULL, NULL),
(57, NULL, NULL, 'Shaista Jabeen', '23015-5030504-1', '036-8895295', '+92', '236, Garden Town, Islamabad', 'Private Sector', '2026-05-22', 'LHR-D-3304/26', 'Postal Service', 'Organization', 'CCRC - LHR', 'court', 'financial_fraud', NULL, '2026-02-02', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Shaista Jabeen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 16:08:00', 'invalid', NULL, 'invalid', NULL, NULL, 12, '2026-06-17 05:48:20', '2026-07-17 05:48:20', 6, 2, NULL, NULL, NULL, NULL),
(58, NULL, 'LHR-C-0058/26', 'Iqbal Hussain', '73917-4890188-6', '035-9997456', '+92', '450, Model Town, Quetta', 'Government Employee', '2026-04-19', 'LHR-D-1084/26', 'Walk-in', 'Court', 'CCRC - ISB', 'court', 'anti_state', 524646.00, '2026-02-18', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Iqbal Hussain. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-01 11:56:00', 'complete', NULL, 'complete', NULL, NULL, 7, '2026-05-22 05:48:20', '2026-07-17 05:48:20', 2, 2, NULL, NULL, NULL, NULL),
(59, NULL, NULL, 'Yasmeen Akhtar', '94778-4816974-4', '037-1329055', '+92', '106, Defence, Quetta', 'Retired', '2026-06-18', 'LHR-D-1271/26', 'Telephone', 'Ministry', 'CCRC - KHI', 'regular', 'hacking', 1534331.00, '2026-04-12', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Yasmeen Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 11:08:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 6, '2026-07-07 05:48:20', '2026-07-17 05:48:20', 10, 1, NULL, NULL, NULL, NULL),
(60, NULL, NULL, 'Riaz Ahmed', '93995-4044539-2', '037-2981011', '+92', '869, Defence, Lahore', 'Lawyer', '2026-06-20', 'LHR-D-4950/26', 'Walk-in', 'PM Office', 'CCRC - KHI', 'anti_state', 'financial_fraud', 1836014.00, '2026-02-07', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Riaz Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-22 17:45:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 2, '2026-07-02 05:48:20', '2026-07-17 05:48:20', 5, 1, NULL, NULL, NULL, NULL),
(61, NULL, NULL, 'Musarat Jahan', '64838-8555755-7', '031-6038107', '+92', '6, Model Town, Quetta', 'Lawyer', '2026-04-28', 'LHR-D-3260/26', 'Email', 'Bank', 'NCCIA - HQs', 'regular', 'defamation', 220098.00, '2026-04-13', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Musarat Jahan. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-30 11:12:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 5, '2026-07-12 05:48:20', '2026-07-17 05:48:20', 10, 4, NULL, NULL, NULL, NULL),
(62, NULL, NULL, 'Sajid Mahmood', '67303-6877312-7', '030-2268665', '+92', '333, Model Town, Peshawar', 'Business Owner', '2026-07-01', 'LHR-D-0124/26', 'Online Portal', 'Court', 'NCCIA - HQs', 'court', 'data_breach', 1560584.00, '2026-01-20', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Sajid Mahmood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 13:20:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 10, '2026-07-12 05:48:20', '2026-07-17 05:48:20', 9, 3, NULL, NULL, NULL, NULL),
(63, NULL, NULL, 'Farzana Bibi', '55406-2345993-8', '030-9532117', '+92', '845, Defence, Quetta', 'Retired', '2026-06-28', 'LHR-D-8489/26', 'Telephone', 'Organization', 'CCRC - ISB', 'regular', 'anti_state', 424962.00, '2026-02-05', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Farzana Bibi. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-17 13:54:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 10, '2026-06-10 05:48:20', '2026-07-17 05:48:20', 3, 4, NULL, NULL, NULL, NULL),
(64, NULL, NULL, 'Arif Hussain', '30789-1078864-7', '036-4467615', '+92', '255, Gulberg, Quetta', 'Government Employee', '2026-06-09', 'LHR-D-4681/26', 'Walk-in', 'Ministry', 'CCRC - ISB', 'anti_state', 'financial_fraud', NULL, '2026-02-05', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Arif Hussain. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-26 12:43:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 5, '2026-05-19 05:48:20', '2026-07-17 05:48:20', 1, 4, NULL, NULL, NULL, NULL);
INSERT INTO `complaints` (`id`, `source`, `tracking_no`, `complainant_name`, `cnic`, `contact_no`, `contact_country_code`, `address`, `profession`, `report_date`, `diary_no`, `received_via`, `received_from`, `cmu`, `priority_type`, `offence_type`, `amount_involved`, `occurrence_date`, `laws`, `description`, `evidence`, `operator_name`, `operator_designation`, `entry_time`, `scrutiny_result`, `operator_remarks`, `status`, `final_status`, `closure_reason`, `user_id`, `created_at`, `updated_at`, `operator_id`, `circle_id`, `merged_with_id`, `transfer_to_department`, `transfer_to_circle_id`, `enquiry_id`) VALUES
(65, NULL, NULL, 'Safina Begum', '83026-3082739-8', '038-8393716', '+92', '498, Gulberg, Quetta', 'Retired', '2026-05-20', 'LHR-D-0466/26', 'Email', 'Bank', 'CCRC - ISB', 'higher_authority', 'hate_speech', NULL, '2026-04-26', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Safina Begum. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-24 10:34:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 1, '2026-06-14 05:48:20', '2026-07-17 05:48:20', 2, 3, NULL, NULL, NULL, NULL),
(66, NULL, 'LHR-C-0066/26', 'Zafar Iqbal', '58733-8764280-3', '032-9504086', '+92', '231, Gulberg, Lahore', 'Government Employee', '2026-04-18', 'LHR-D-2934/26', 'Online Portal', 'Organization', 'NCCIA - HQs', 'anti_state', 'online_scam', NULL, '2026-04-13', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Zafar Iqbal. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-13 13:07:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 1, '2026-05-05 05:48:20', '2026-07-17 05:48:20', 2, 2, NULL, NULL, NULL, NULL),
(67, NULL, 'UET-C-0067/26', 'Samina Parveen', '25404-5352766-2', '036-8918231', '+92', '361, Model Town, Quetta', 'Bank Employee', '2026-07-07', 'LHR-D-3470/26', 'Postal Service', 'PM Office', 'NCCIA - HQs', 'anti_state', 'financial_fraud', 4356146.00, '2026-04-10', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Samina Parveen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-21 14:25:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 4, '2026-06-21 05:48:20', '2026-07-17 05:48:20', 2, 4, NULL, NULL, NULL, NULL),
(68, NULL, NULL, 'Abdul Majeed', '49893-5154530-9', '038-1559701', '+92', '237, Main Blvd, Lahore', 'Government Employee', '2026-05-22', 'LHR-D-9699/26', 'Postal Service', 'Ministry', 'CCRC - LHR', 'higher_authority', 'hate_speech', 1832744.00, '2026-07-12', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Abdul Majeed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-27 17:32:00', 'invalid', NULL, 'invalid', NULL, NULL, 9, '2026-04-18 05:48:20', '2026-07-17 05:48:20', 7, 2, NULL, NULL, NULL, NULL),
(69, NULL, 'UET-C-0069/26', 'Noreen Akhtar', '78703-9197618-7', '032-1204397', '+92', '368, Main Blvd, Karachi', 'Lawyer', '2026-07-07', 'LHR-D-2737/26', 'Email', 'Court', 'CCRC - KHI', 'anti_state', 'hate_speech', NULL, '2026-05-12', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Noreen Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-21 12:30:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 8, '2026-04-24 05:48:20', '2026-07-17 05:48:20', 5, 4, NULL, NULL, NULL, NULL),
(70, NULL, NULL, 'Tariq Javed', '19097-4358276-8', '036-5648242', '+92', '531, Model Town, Karachi', 'Retired', '2026-05-10', 'LHR-D-4823/26', 'Postal Service', 'PM Office', 'NCCIA - HQs', 'higher_authority', 'online_scam', 2925612.00, '2026-06-25', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Tariq Javed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-30 14:22:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 8, '2026-04-23 05:48:20', '2026-07-17 05:48:20', 9, 4, NULL, NULL, NULL, NULL),
(71, NULL, NULL, 'Shabana Kausar', '87111-3399686-4', '038-2077804', '+92', '681, Garden Town, Lahore', 'Private Sector', '2026-05-10', 'LHR-D-6169/26', 'Email', 'Ministry', 'CCRC - KHI', 'court', 'harassment', 3067360.00, '2026-03-18', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Shabana Kausar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-08 12:50:00', 'invalid', NULL, 'invalid', NULL, NULL, 12, '2026-06-23 05:48:20', '2026-07-17 05:48:20', 12, 4, NULL, NULL, NULL, NULL),
(72, NULL, 'UET-C-0072/26', 'Mohsin Ali', '84897-9391390-1', '030-6592815', '+92', '832, Model Town, Lahore', 'Government Employee', '2026-04-28', 'LHR-D-7968/26', 'Telephone', 'Court', 'CCRC - ISB', 'court', 'defamation', NULL, '2026-07-09', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Mohsin Ali. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-27 13:17:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 4, '2026-05-20 05:48:20', '2026-07-17 05:48:20', 12, 4, NULL, NULL, NULL, NULL),
(73, NULL, NULL, 'Nasreen Sultana', '15595-8754201-6', '034-4596205', '+92', '35, Defence, Peshawar', 'Private Sector', '2026-05-01', 'LHR-D-2578/26', 'Email', 'Ministry', 'CCRC - KHI', 'court', 'crypto_fraud', NULL, '2026-03-02', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Nasreen Sultana. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-28 11:05:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 5, '2026-05-16 05:48:20', '2026-07-17 05:48:20', 11, 1, NULL, NULL, NULL, NULL),
(74, NULL, NULL, 'Rashid Mahmood', '83890-1592939-4', '035-3620864', '+92', '126, Model Town, Quetta', 'Bank Employee', '2026-04-23', 'LHR-D-4910/26', 'Tipline', 'General Public', 'NCCIA - HQs', 'court', 'financial_fraud', NULL, '2026-03-12', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Rashid Mahmood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-06 10:36:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 5, '2026-06-21 05:48:20', '2026-07-17 05:48:20', 11, 3, NULL, NULL, NULL, NULL),
(75, NULL, NULL, 'Fahmida Bibi', '73044-5178066-2', '038-1259285', '+92', '894, Gulberg, Quetta', 'Student', '2026-05-10', 'LHR-D-1295/26', 'Telephone', 'Anonymous', 'CCRC - ISB', 'court', 'online_scam', 3365342.00, '2026-04-23', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Fahmida Bibi. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-18 15:41:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 8, '2026-06-02 05:48:20', '2026-07-17 05:48:20', 5, 1, NULL, NULL, NULL, NULL),
(76, NULL, NULL, 'Shahid Mahmood', '84665-6030895-2', '032-3341155', '+92', '706, Main Blvd, Lahore', 'Lawyer', '2026-07-06', 'LHR-D-8750/26', 'Walk-in', 'Court', 'CCRC - KHI', 'court', 'hate_speech', 3403580.00, '2026-05-29', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Shahid Mahmood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-30 15:37:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 2, '2026-04-22 05:48:20', '2026-07-17 05:48:20', 11, 3, NULL, NULL, NULL, NULL),
(77, NULL, 'KHI-C-0077/26', 'Ghulam Fatima', '22885-9854905-2', '039-4512303', '+92', '113, Defence, Lahore', 'Private Sector', '2026-06-08', 'LHR-D-1061/26', 'Telephone', 'Court', 'NCCIA - HQs', 'anti_state', 'online_scam', 4310302.00, '2026-06-02', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Ghulam Fatima. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-24 15:13:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 10, '2026-05-01 05:48:20', '2026-07-17 05:48:20', 7, 3, NULL, NULL, NULL, NULL),
(78, NULL, NULL, 'Arshad Mehmood', '97597-1795850-6', '037-8540887', '+92', '855, Defence, Quetta', 'Teacher', '2026-05-01', 'LHR-D-6629/26', 'Email', 'Organization', 'CCRC - LHR', 'regular', 'data_breach', 2945663.00, '2026-05-16', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Arshad Mehmood. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-23 16:38:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 11, '2026-04-27 05:48:20', '2026-07-17 05:48:20', 6, 2, NULL, NULL, NULL, NULL),
(79, NULL, NULL, 'Shamim Akhtar', '23106-5773628-1', '038-8044518', '+92', '524, Main Blvd, Karachi', 'Retired', '2026-07-13', 'LHR-D-2807/26', 'Telephone', 'PM Office', 'CCRC - ISB', 'higher_authority', 'impersonation', NULL, '2026-03-27', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Shamim Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-13 13:15:00', 'invalid', NULL, 'invalid', NULL, NULL, 1, '2026-05-31 05:48:20', '2026-07-17 05:48:20', 3, 1, NULL, NULL, NULL, NULL),
(80, NULL, NULL, 'Saleem Raza', '40086-3249449-1', '035-4313350', '+92', '771, Main Blvd, Lahore', 'Student', '2026-07-14', 'LHR-D-9696/26', 'Tipline', 'General Public', 'CCRC - ISB', 'higher_authority', 'anti_state', 3218117.00, '2026-04-20', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Saleem Raza. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-02 14:48:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 2, '2026-07-03 05:48:20', '2026-07-17 05:48:20', 6, 4, NULL, NULL, NULL, NULL),
(81, NULL, NULL, 'Sajida Parveen', '20998-5336299-7', '031-6241636', '+92', '192, Model Town, Lahore', 'Retired', '2026-06-05', 'LHR-D-4725/26', 'Email', 'Anonymous', 'NCCIA - HQs', 'court', 'extortion', 3188713.00, '2026-06-14', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Sajida Parveen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-23 17:41:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 8, '2026-05-31 05:48:20', '2026-07-17 05:48:20', 7, 2, NULL, NULL, NULL, NULL),
(82, NULL, 'UET-C-0082/26', 'Nisar Ahmed', '31792-1179910-2', '037-4678111', '+92', '127, Gulberg, Peshawar', 'Retired', '2026-04-30', 'LHR-D-3741/26', 'Email', 'Bank', 'NCCIA - HQs', 'regular', 'financial_fraud', 193737.00, '2026-01-22', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Nisar Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-11 10:20:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 5, '2026-06-22 05:48:20', '2026-07-17 05:48:20', 2, 4, NULL, NULL, NULL, NULL),
(83, NULL, NULL, 'Shakila Bano', '39622-8636344-6', '030-4297469', '+92', '345, Main Blvd, Peshawar', 'Retired', '2026-06-02', 'LHR-D-7594/26', 'Walk-in', 'Bank', 'CCRC - KHI', 'anti_state', 'defamation', 3254318.00, '2026-06-29', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding defamation — detailed description of the incident involving Shakila Bano. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-29 11:28:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 7, '2026-06-16 05:48:20', '2026-07-17 05:48:20', 2, 4, NULL, NULL, NULL, NULL),
(84, NULL, NULL, 'Mazhar Iqbal', '68762-6682989-2', '035-1859226', '+92', '435, Model Town, Peshawar', 'Bank Employee', '2026-07-01', 'LHR-D-0883/26', 'Walk-in', 'Bank', 'CCRC - LHR', 'higher_authority', 'malware', 1633242.00, '2026-02-27', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Mazhar Iqbal. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-25 13:11:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 12, '2026-05-25 05:48:20', '2026-07-17 05:48:20', 11, 1, NULL, NULL, NULL, NULL),
(85, NULL, NULL, 'Zareen Taj', '89872-2879874-7', '037-6005322', '+92', '235, Model Town, Peshawar', 'Government Employee', '2026-06-07', 'LHR-D-8681/26', 'Online Portal', 'Organization', 'CCRC - ISB', 'anti_state', 'data_breach', 3811140.00, '2026-02-15', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Zareen Taj. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-13 09:26:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 9, '2026-06-07 05:48:20', '2026-07-17 05:48:20', 8, 2, NULL, NULL, NULL, NULL),
(86, NULL, NULL, 'Khurshid Ahmed', '18829-7274335-5', '036-4748249', '+92', '239, Garden Town, Lahore', 'Bank Employee', '2026-05-29', 'LHR-D-8892/26', 'Email', 'Anonymous', 'CCRC - LHR', 'anti_state', 'hacking', NULL, '2026-03-09', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Khurshid Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-14 10:03:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 11, '2026-05-20 05:48:20', '2026-07-17 05:48:21', 6, 4, NULL, NULL, NULL, NULL),
(87, NULL, NULL, 'Riffat Jahan', '89885-9550624-7', '033-3943083', '+92', '745, Garden Town, Peshawar', 'Lawyer', '2026-05-07', 'LHR-D-9718/26', 'Tipline', 'Organization', 'CCRC - LHR', 'higher_authority', 'harassment', 4330199.00, '2026-05-14', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Riffat Jahan. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-22 14:18:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 5, '2026-04-29 05:48:21', '2026-07-17 05:48:21', 8, 2, NULL, NULL, NULL, NULL),
(88, NULL, NULL, 'Ashfaq Ahmed', '86347-9227812-3', '034-7948234', '+92', '120, Garden Town, Lahore', 'Student', '2026-05-05', 'LHR-D-0161/26', 'Walk-in', 'General Public', 'CCRC - LHR', 'anti_state', 'malware', 3042160.00, '2026-02-27', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Ashfaq Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-16 14:36:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 5, '2026-04-27 05:48:21', '2026-07-17 05:48:21', 2, 1, NULL, NULL, NULL, NULL),
(89, NULL, 'KHI-C-0089/26', 'Khalida Perveen', '88921-3972045-8', '033-8907030', '+92', '811, Main Blvd, Quetta', 'Private Sector', '2026-07-10', 'LHR-D-7413/26', 'Telephone', 'Organization', 'CCRC - ISB', 'court', 'financial_fraud', 3233195.00, '2026-07-03', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding hacking — detailed description of the incident involving Khalida Perveen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-11 09:46:00', 'complete', NULL, 'complete', NULL, NULL, 5, '2026-05-25 05:48:21', '2026-07-17 05:48:21', 12, 3, NULL, NULL, NULL, NULL),
(90, NULL, NULL, 'Shafiq Ahmed', '35898-7739291-1', '031-5425887', '+92', '330, Main Blvd, Lahore', 'Bank Employee', '2026-04-28', 'LHR-D-5387/26', 'Walk-in', 'Ministry', 'NCCIA - HQs', 'higher_authority', 'impersonation', NULL, '2026-02-13', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Shafiq Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-20 09:55:00', 'invalid', NULL, 'invalid', NULL, NULL, 2, '2026-04-24 05:48:21', '2026-07-17 05:48:21', 5, 1, NULL, NULL, NULL, NULL),
(91, NULL, NULL, 'Zakia Sultana', '43541-2600526-5', '035-7887476', '+92', '341, Model Town, Islamabad', 'Student', '2026-06-05', 'LHR-D-6025/26', 'Walk-in', 'General Public', 'CCRC - KHI', 'regular', 'hacking', NULL, '2026-03-03', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding extortion — detailed description of the incident involving Zakia Sultana. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-29 12:46:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 6, '2026-05-13 05:48:21', '2026-07-17 05:48:21', 4, 2, NULL, NULL, NULL, NULL),
(92, NULL, 'UET-C-0092/26', 'Fida Hussain', '46639-3491066-9', '032-8427485', '+92', '151, Model Town, Peshawar', 'Private Sector', '2026-05-01', 'LHR-D-3288/26', 'Email', 'Bank', 'CCRC - ISB', 'court', 'extortion', 3519497.00, '2026-02-14', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Fida Hussain. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-08 15:03:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 8, '2026-06-27 05:48:21', '2026-07-17 05:48:21', 11, 4, NULL, NULL, NULL, NULL),
(93, NULL, NULL, 'Naseem Akhtar', '46830-9787236-1', '031-3666765', '+92', '486, Model Town, Quetta', 'Lawyer', '2026-06-20', 'LHR-D-0787/26', 'Walk-in', 'Anonymous', 'CCRC - ISB', 'anti_state', 'impersonation', NULL, '2026-05-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding online fraud — detailed description of the incident involving Naseem Akhtar. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-26 09:21:00', 'incomplete', NULL, 'incomplete', NULL, NULL, 7, '2026-05-02 05:48:21', '2026-07-17 05:48:21', 2, 3, NULL, NULL, NULL, NULL),
(94, NULL, NULL, 'Anwar Ali', '96175-5077966-9', '035-1791216', '+92', '260, Garden Town, Quetta', 'Business Owner', '2026-07-04', 'LHR-D-2845/26', 'Tipline', 'Bank', 'CCRC - ISB', 'regular', 'defamation', NULL, '2026-06-24', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Anwar Ali. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-03 15:58:00', 'invalid', NULL, 'invalid', NULL, NULL, 12, '2026-07-05 05:48:21', '2026-07-17 05:48:21', 1, 1, NULL, NULL, NULL, NULL),
(95, NULL, NULL, 'Sughran Bibi', '60087-4325679-4', '033-2895671', '+92', '169, Gulberg, Islamabad', 'Private Sector', '2026-06-20', 'LHR-D-1936/26', 'Email', 'General Public', 'NCCIA - HQs', 'higher_authority', 'malware', 3036398.00, '2026-03-11', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding cyberstalking — detailed description of the incident involving Sughran Bibi. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-06-25 11:55:00', 'irrelevant', 'Initial review completed. Case requires verification.', 'irrelevant', NULL, NULL, 10, '2026-05-03 05:48:21', '2026-07-17 05:48:21', 7, 1, NULL, NULL, NULL, NULL),
(96, NULL, NULL, 'Shahid Nazir', '61568-8662964-3', '039-6489646', '+92', '120, Garden Town, Peshawar', 'Student', '2026-05-31', 'LHR-D-2568/26', 'Telephone', 'Anonymous', 'CCRC - ISB', 'higher_authority', 'hacking', 3479691.00, '2026-02-27', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Shahid Nazir. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-12 10:23:00', 'irrelevant', NULL, 'irrelevant', NULL, NULL, 7, '2026-04-22 05:48:21', '2026-07-17 05:48:21', 4, 2, NULL, NULL, NULL, NULL),
(97, NULL, NULL, 'Hajra Bibi', '13571-9801551-9', '032-2389981', '+92', '332, Model Town, Islamabad', 'Bank Employee', '2026-06-28', 'LHR-D-9511/26', 'Online Portal', 'Organization', 'CCRC - ISB', 'anti_state', 'harassment', NULL, '2026-03-20', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Hajra Bibi. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-14 16:22:00', 'incomplete', 'Initial review completed. Case requires verification.', 'incomplete', NULL, NULL, 6, '2026-07-15 05:48:21', '2026-07-17 05:48:21', 4, 2, NULL, NULL, NULL, NULL),
(98, NULL, 'ISB-C-0098/26', 'Aslam Pervez', '59237-2697462-9', '034-5576278', '+92', '999, Defence, Quetta', 'Lawyer', '2026-05-17', 'LHR-D-8349/26', 'Email', 'Organization', 'CCRC - LHR', 'higher_authority', 'crypto_fraud', 4513684.00, '2026-02-19', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding bank fraud — detailed description of the incident involving Aslam Pervez. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-15 15:13:00', 'complete', NULL, 'complete', NULL, NULL, 8, '2026-06-12 05:48:21', '2026-07-17 05:48:21', 9, 1, NULL, NULL, NULL, NULL),
(99, NULL, 'UET-C-0099/26', 'Azra Parveen', '69973-7334854-2', '038-3493943', '+92', '80, Defence, Lahore', 'Student', '2026-07-07', 'LHR-D-1361/26', 'Walk-in', 'PM Office', 'NCCIA - HQs', 'regular', 'hacking', 2653155.00, '2026-02-27', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding harassment — detailed description of the incident involving Azra Parveen. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-12 17:47:00', 'complete', NULL, 'complete', NULL, NULL, 3, '2026-05-18 05:48:21', '2026-07-17 05:48:21', 7, 4, NULL, NULL, NULL, NULL),
(100, NULL, 'UET-C-0100/26', 'Iftikhar Ahmed', '33920-1058573-5', '032-5257753', '+92', '361, Defence, Lahore', 'Student', '2026-05-05', 'LHR-D-1325/26', 'Telephone', 'PM Office', 'NCCIA - HQs', 'higher_authority', 'anti_state', 3860638.00, '2026-07-16', '[\"peca_26A\", \"peca_24\", \"peca_3\", \"ppc_420\", \"ppc_506\", \"ata\"]', 'Complaint regarding identity theft — detailed description of the incident involving Iftikhar Ahmed. Further investigation required to ascertain the facts.', '[\"screenshots\", \"chat_logs\", \"bank_records\", \"call_records\"]', 'Muhammad Umar Ilyas', 'Asst. Sub Inspector', '2026-07-09 16:20:00', 'complete', 'Initial review completed. Case requires verification.', 'complete', NULL, NULL, 11, '2026-07-04 05:48:21', '2026-07-17 05:48:21', 4, 4, NULL, NULL, NULL, NULL),
(205, NULL, '1/26', 'ahmmad', '87467-7673467-6', '6674467746', '+92', 'na', NULL, '2026-07-27', '8888', 'na', 'na', 'na', 'normal', 'defamation', NULL, '2026-07-29', '[]', 'na', '[]', 'Admin', 'admin', '2026-07-27 16:35:00', NULL, NULL, 'complete', NULL, NULL, 12, '2026-07-27 06:39:16', '2026-07-27 06:39:16', NULL, NULL, NULL, NULL, NULL, NULL),
(236, NULL, '101/26', 'arhum', '89446-8483468-4', '8644348446', '+92', 'na', NULL, '2026-07-26', '8888', 'Email', 'NGOs', 'Zonal Directorate', 'normal', 'ransomware', NULL, '2026-07-20', '[]', 'na', '[]', 'Admin', 'admin', '2026-07-27 21:39:00', 'complete', NULL, 'complete', NULL, NULL, 12, '2026-07-27 11:42:07', '2026-07-27 11:42:07', NULL, NULL, NULL, NULL, NULL, NULL),
(237, NULL, '102/26', 'shahan', '34101-7628323-3', '7238963982', '+92', 'Bilal town', 'Development', '2026-07-28', '3', 'Individually', 'National & International (Tipline)', 'NCCIA - HQ', 'high', 'financial_fraud', 12312.00, '2026-07-28', '[]', '123', '[]', 'Admin', 'admin', '2026-07-28 11:27:00', 'complete', NULL, 'complete', NULL, NULL, 12, '2026-07-28 01:29:18', '2026-07-28 01:34:03', NULL, NULL, NULL, NULL, NULL, NULL),
(238, NULL, '103/26', 'zillay', '34101-5124365-5', '3320141562', '+92', 'fchgkjcbm.', 'nmkjhg', '2026-07-29', '2465', 'Individually', 'General Public', 'NCCIA - HQ', 'high', 'online_fraud', 500000.00, '2026-07-29', '[]', 'fgdxgtgjmcghfv', '[]', 'Admin', 'admin', '2026-07-29 12:19:00', 'complete', NULL, 'complete', NULL, NULL, 12, '2026-07-29 02:32:39', '2026-07-29 02:33:52', NULL, NULL, NULL, NULL, NULL, NULL),
(239, NULL, '104/26', 'humayunn', '78985-7584344-3', '4864844548', '+92', 'wiuqhqwdiqqwqd', NULL, '2026-08-03', '888', 'Telephone', 'General Public', 'NCCIA - HQ', 'normal', 'cyberstalking', NULL, '2026-08-03', '[]', 'asdsa', '[]', 'Admin', 'admin', '2026-08-02 04:31:00', 'complete', 'dadsaaaw', 'complete', NULL, NULL, 12, '2026-08-02 06:35:15', '2026-08-02 06:37:27', NULL, NULL, NULL, NULL, NULL, NULL),
(240, NULL, '105/26', 'ali', '22222-2222222-2', '3213213232', '+92', 'gujranwala', NULL, '2026-08-04', '33', 'Telephone', 'General Public', 'NCCIA - HQ', 'high', 'cyberstalking', 20000.00, '2026-07-28', '[]', 'images blackmail', '[]', 'Admin', 'admin', '2026-08-04 12:27:00', 'complete', NULL, 'complete', NULL, NULL, 12, '2026-08-04 02:29:17', '2026-08-04 02:29:34', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `court_cases`
--

CREATE TABLE `court_cases` (
  `id` bigint UNSIGNED NOT NULL,
  `case_id` bigint UNSIGNED NOT NULL,
  `court_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `judge_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filing_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'filed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `court_hearings`
--

CREATE TABLE `court_hearings` (
  `id` bigint UNSIGNED NOT NULL,
  `court_case_id` bigint UNSIGNED NOT NULL,
  `hearing_date` date NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `next_hearing_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `court_reports`
--

CREATE TABLE `court_reports` (
  `id` bigint UNSIGNED NOT NULL,
  `court_case_id` bigint UNSIGNED NOT NULL,
  `report_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `court_verdicts`
--

CREATE TABLE `court_verdicts` (
  `id` bigint UNSIGNED NOT NULL,
  `court_case_id` bigint UNSIGNED NOT NULL,
  `verdict` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verdict_date` date NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` bigint UNSIGNED NOT NULL,
  `complaint_id` bigint UNSIGNED NOT NULL,
  `enquiry_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reg_date` date DEFAULT NULL,
  `enquiry_officer_id` bigint UNSIGNED DEFAULT NULL,
  `assignment_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registered',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `recommendation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cfr_summary` text COLLATE utf8mb4_unicode_ci,
  `closure_reason` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_circle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `merge_complaint_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `case_file_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enquiries`
--

INSERT INTO `enquiries` (`id`, `complaint_id`, `enquiry_number`, `reg_date`, `enquiry_officer_id`, `assignment_date`, `status`, `submitted_at`, `approved_at`, `recommendation`, `cfr_summary`, `closure_reason`, `transfer_department`, `transfer_circle`, `merge_complaint_id`, `created_at`, `updated_at`, `case_file_id`) VALUES
(1, 236, 'CCW-E-1/26', '2026-07-28', 20, NULL, 'registered', NULL, NULL, 'closure', NULL, 'non_pursuance', 'na', 'Islamabad Circle', NULL, '2026-07-27 23:52:43', '2026-07-27 23:52:43', NULL),
(2, 240, '4444', '2026-08-04', 4, NULL, 'registered', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-08-04 03:07:45', '2026-08-04 03:07:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `enquiry_activities`
--

CREATE TABLE `enquiry_activities` (
  `id` bigint UNSIGNED NOT NULL,
  `enquiry_id` bigint UNSIGNED NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_date` date NOT NULL,
  `attachment_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enquiry_activities`
--

INSERT INTO `enquiry_activities` (`id`, `enquiry_id`, `type`, `description`, `activity_date`, `attachment_path`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'dac_request', 'DAC Request', '2026-07-28', NULL, 12, '2026-07-27 23:52:43', '2026-07-27 23:52:43'),
(2, 2, 'dac_request', 'DAC Request', '2026-08-04', NULL, 3, '2026-08-04 03:07:45', '2026-08-04 03:07:45'),
(3, 2, 'notices', 'Notices Issued', '2026-08-04', NULL, 3, '2026-08-04 03:07:45', '2026-08-04 03:07:45'),
(4, 2, 'notices', 'Notices Issued', '2026-08-04', NULL, 3, '2026-08-04 03:07:45', '2026-08-04 03:07:45'),
(5, 2, 'diaries', 'Diaries Maintained', '2026-08-04', NULL, 3, '2026-08-04 03:07:45', '2026-08-04 03:07:45'),
(6, 2, 'notices', 'Notices Issued', '2026-08-04', NULL, 3, '2026-08-04 03:07:45', '2026-08-04 03:07:45'),
(7, 2, 'cfr', 'CFR Submitted', '2026-08-04', NULL, 3, '2026-08-04 03:07:45', '2026-08-04 03:07:45');

-- --------------------------------------------------------

--
-- Table structure for table `enquiry_approvals`
--

CREATE TABLE `enquiry_approvals` (
  `id` bigint UNSIGNED NOT NULL,
  `enquiry_id` bigint UNSIGNED NOT NULL,
  `circle_incharge_id` bigint UNSIGNED NOT NULL,
  `decision` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enquiry_legal_opinions`
--

CREATE TABLE `enquiry_legal_opinions` (
  `id` bigint UNSIGNED NOT NULL,
  `enquiry_id` bigint UNSIGNED NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `opinion_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `decision` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `investigation_officers`
--

CREATE TABLE `investigation_officers` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `circle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_country_code` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT '+92',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `investigation_officers`
--

INSERT INTO `investigation_officers` (`id`, `name`, `badge_no`, `designation`, `circle`, `zone`, `contact_no`, `contact_country_code`, `email`, `address`, `date_of_joining`, `status`, `remarks`, `created_at`, `updated_at`, `user_id`) VALUES
(1, 'ali raza', '2608', 'sub inspector', 'lahore', 'shadar', '32432911285', '+92', 'humayunchodhary@gmail.com', NULL, '2026-07-01', 'active', NULL, '2026-07-18 02:15:07', '2026-07-28 01:57:32', NULL),
(8, 'arslan', '3006', 'sub inspector', 'lahore', 'shadra', '7577657', '+92', NULL, NULL, '2026-07-16', 'active', NULL, '2026-07-21 04:56:25', '2026-07-24 03:03:50', 17),
(9, 'Testing', '123', 'abc', 'Islamabad Circle', 'North Zone', NULL, '+92', NULL, NULL, NULL, 'active', NULL, '2026-07-24 04:52:35', '2026-07-28 00:42:27', NULL),
(10, 'humayun', '2060', 'inspector', NULL, NULL, '3895895899', '+92', 'humayunchodhary@gmail.com', 'xyz', NULL, 'active', NULL, '2026-07-25 03:24:12', '2026-07-25 03:24:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laws`
--

CREATE TABLE `laws` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `act_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000001_create_professions_table', 1),
(5, '2024_01_01_000002_create_received_via_options_table', 1),
(6, '2024_01_01_000003_create_received_from_options_table', 1),
(7, '2024_01_01_000004_create_cmu_options_table', 1),
(8, '2024_01_01_000005_create_offence_types_table', 1),
(9, '2024_01_01_000010_create_complaints_table', 1),
(10, '2024_01_01_000011_create_zones_table', 1),
(11, '2024_01_01_000012_create_circles_table', 1),
(12, '2024_01_01_000013_add_organization_fields_to_users_table', 1),
(13, '2024_01_01_000014_create_permission_tables', 1),
(14, '2024_07_01_000030_add_fields_to_complaints_table', 1),
(15, '2024_07_01_000040_create_verifications_table', 1),
(16, '2024_07_01_000041_create_verification_approvals_table', 1),
(17, '2024_07_01_000045_update_verifications_table', 1),
(18, '2024_07_01_000050_create_enquiries_table', 1),
(19, '2024_07_01_000051_create_enquiry_activities_table', 1),
(20, '2024_07_01_000052_create_enquiry_legal_opinions_table', 1),
(21, '2024_07_01_000053_create_enquiry_approvals_table', 1),
(22, '2024_07_01_000060_create_cases_table', 1),
(23, '2024_07_01_000061_create_case_activities_table', 1),
(24, '2024_07_01_000062_create_arrests_table', 1),
(25, '2024_07_01_000063_create_case_legal_opinions_table', 1),
(26, '2024_07_01_000064_create_case_approvals_table', 1),
(27, '2024_07_01_000070_create_court_cases_table', 1),
(28, '2024_07_01_000071_create_court_hearings_table', 1),
(29, '2024_07_01_000072_create_court_reports_table', 1),
(30, '2024_07_01_000073_create_court_verdicts_table', 1),
(31, '2024_07_01_000074_add_final_status_to_complaints_table', 1),
(32, '2024_07_01_000080_create_activity_log_table', 1),
(33, '2024_07_01_000081_add_event_column_to_activity_log_table', 1),
(34, '2024_07_01_000082_add_batch_uuid_column_to_activity_log_table', 1),
(35, '2026_07_15_000001_create_verification_reports_table', 1),
(36, '2026_07_16_000001_add_signature_to_verification_reports_table', 1),
(37, '2026_07_16_000002_create_investigation_officers_table', 1),
(38, '2026_07_19_125912_add_user_id_to_investigation_officers_table', 2),
(39, '2026_07_19_190210_assign_admin_role_to_admin_user', 3),
(40, '2026_07_19_191500_fix_admin_role_assignment', 4),
(41, '2026_07_20_000001_sync_io_data_to_users', 5),
(42, '2026_07_23_000001_add_contact_country_code_to_tables', 6),
(43, '2026_07_25_000001_create_otps_table', 7),
(44, '2026_07_25_000002_make_scrutiny_result_nullable', 8),
(45, '2026_07_27_000001_add_recommendation_fields_to_verification_approvals_table', 9),
(46, '2026_07_27_000002_add_outcome_fields_to_complaints_table', 10),
(47, '2026_07_27_000003_add_fields_to_enquiries_table', 11),
(48, '2026_07_28_000001_add_signature_to_users_table', 11),
(49, '2026_07_28_000002_add_recommendation_to_verification_reports_table', 12),
(50, '2026_07_28_000003_create_laws_table', 13),
(51, '2026_07_28_000004_create_rules_table', 13),
(52, '2026_07_28_000005_create_sops_table', 13),
(53, '2026_07_28_000006_create_user_manuals_table', 13);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_permissions`
--

INSERT INTO `model_has_permissions` (`permission_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 5),
(3, 'App\\Models\\User', 5),
(6, 'App\\Models\\User', 5),
(9, 'App\\Models\\User', 5),
(4, 'App\\Models\\User', 21);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 3),
(4, 'App\\Models\\User', 4),
(5, 'App\\Models\\User', 5),
(6, 'App\\Models\\User', 6),
(7, 'App\\Models\\User', 7),
(8, 'App\\Models\\User', 8),
(9, 'App\\Models\\User', 9),
(10, 'App\\Models\\User', 10),
(11, 'App\\Models\\User', 11),
(12, 'App\\Models\\User', 12),
(2, 'App\\Models\\User', 14),
(5, 'App\\Models\\User', 15),
(5, 'App\\Models\\User', 17),
(10, 'App\\Models\\User', 19),
(4, 'App\\Models\\User', 20),
(3, 'App\\Models\\User', 21),
(5, 'App\\Models\\User', 22),
(2, 'App\\Models\\User', 23);

-- --------------------------------------------------------

--
-- Table structure for table `offence_types`
--

CREATE TABLE `offence_types` (
  `id` bigint UNSIGNED NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `offence_types`
--

INSERT INTO `offence_types` (`id`, `group`, `name`, `value`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Cyber Stalking (Section 414 PPC)', 'cyberstalking', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(2, NULL, 'Identity Theft / Impersonation', 'identity_theft', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(3, NULL, 'Hacking / Unauthorized Access', 'hacking', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(4, NULL, 'Online Fraud / Scam', 'online_fraud', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(5, NULL, 'Data Breach / Data Theft', 'data_breach', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(6, NULL, 'Ransomware Attack', 'ransomware', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(7, NULL, 'Child Sexual Abuse Material (CSAM)', 'child_abuse', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(8, NULL, 'Social Media Harassment', 'social_media', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(9, NULL, 'Email Spoofing / Phishing', 'email_spoofing', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(10, NULL, 'Online Defamation / Hate Speech', 'defamation', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(11, NULL, 'Cyber Terrorism', 'cyber_terrorism', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(12, NULL, 'Financial Fraud / Banking Fraud', 'financial_fraud', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(13, NULL, 'Online Extortion / Blackmail', 'extortion', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(14, NULL, 'Fake Accounts / Fake Profiles', 'fake_accounts', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(15, NULL, 'Illegal Content Upload / Distribution', 'illegal_content', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(16, NULL, 'Others (Any Other Cyber Crime)', 'others', '2026-07-17 05:48:16', '2026-07-17 05:48:16');

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` bigint UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'io_access',
  `expires_at` timestamp NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `email`, `otp`, `type`, `expires_at`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 'humayunchodhary@gmail.com', '014106', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:24:21', '2026-08-04 03:39:18'),
(2, 'humayunchodhary@gmail.com', '877437', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:24:29', '2026-08-04 03:39:18'),
(3, 'humayunchodhary@gmail.com', '203764', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:26:25', '2026-08-04 03:39:18'),
(4, 'humayunchodhary@gmail.com', '377435', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:26:26', '2026-08-04 03:39:18'),
(5, 'humayunchodhary@gmail.com', '789068', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:26:35', '2026-08-04 03:39:18'),
(6, 'humayunchodhary@gmail.com', '009843', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:30:58', '2026-08-04 03:39:18'),
(7, 'humayunchodhary@gmail.com', '815510', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:31:43', '2026-08-04 03:39:18'),
(8, 'humayunchodhary@gmail.com', '325814', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:32:44', '2026-08-04 03:39:18'),
(9, 'humayunchodhary@gmail.com', '020684', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:32:45', '2026-08-04 03:39:18'),
(10, 'humayunchodhary@gmail.com', '373637', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:32:52', '2026-08-04 03:39:18'),
(11, '247260@students.au.edu.pk', '877794', 'io_access', '2026-07-25 03:36:00', NULL, '2026-07-25 03:33:23', '2026-07-25 03:36:00'),
(12, '247260@students.au.edu.pk', '655830', 'io_access', '2026-07-25 03:36:00', NULL, '2026-07-25 03:33:24', '2026-07-25 03:36:00'),
(13, '247260@students.au.edu.pk', '798083', 'io_access', '2026-07-25 03:46:00', NULL, '2026-07-25 03:36:00', '2026-07-25 03:36:00'),
(14, 'humayunchodhary@gmail.com', '680457', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:36:13', '2026-08-04 03:39:18'),
(15, 'humayunchodhary@gmail.com', '536661', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:37:19', '2026-08-04 03:39:18'),
(16, 'humayunchodhary@gmail.com', '989859', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:37:36', '2026-08-04 03:39:18'),
(17, 'humayunchodhary@gmail.com', '205493', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:38:09', '2026-08-04 03:39:18'),
(18, 'humayunchodhary@gmail.com', '613581', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:38:46', '2026-08-04 03:39:18'),
(19, 'humayunchodhary@gmail.com', '570891', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:38:47', '2026-08-04 03:39:18'),
(20, 'humayunchodhary@gmail.com', '444250', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:38:48', '2026-08-04 03:39:18'),
(21, 'humayunchodhary@gmail.com', '933230', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 03:38:49', '2026-08-04 03:39:18'),
(22, 'humayunchodhary@gmail.com', '765728', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 05:18:16', '2026-08-04 03:39:18'),
(23, 'humayunchodhary@gmail.com', '782057', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-25 05:18:18', '2026-08-04 03:39:18'),
(24, '2608@nccia.gov.pk', '774779', 'io_access', '2026-07-28 00:53:04', NULL, '2026-07-28 00:43:04', '2026-07-28 00:43:04'),
(25, 'humayunchodhary@gmail.com', '009097', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 00:43:46', '2026-08-04 03:39:18'),
(26, 'humayunchodhary@gmail.com', '045836', 'io_access', '2026-07-28 01:52:23', '2026-07-28 01:42:30', '2026-07-28 01:42:23', '2026-07-28 01:42:30'),
(27, 'humayunchodhary@gmail.com', '696871', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 01:57:49', '2026-08-04 03:39:18'),
(28, 'humayunchodhary@gmail.com', '075278', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 01:58:12', '2026-08-04 03:39:18'),
(29, 'humayunchodhary@gmail.com', '962528', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:06:02', '2026-08-04 03:39:18'),
(30, 'humayunchodhary@gmail.com', '086024', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:06:10', '2026-08-04 03:39:18'),
(31, 'humayunchodhary@gmail.com', '733934', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:17:57', '2026-08-04 03:39:18'),
(32, 'humayunchodhary@gmail.com', '464099', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:21:13', '2026-08-04 03:39:18'),
(33, 'humayunchodhary@gmail.com', '864223', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:22:56', '2026-08-04 03:39:18'),
(34, 'humayunchodhary@gmail.com', '709131', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:23:15', '2026-08-04 03:39:18'),
(35, '123@nccia.gov.pk', '965320', 'io_access', '2026-07-28 02:34:00', NULL, '2026-07-28 02:24:00', '2026-07-28 02:24:00'),
(36, 'humayunchodhary@gmail.com', '565661', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:24:39', '2026-08-04 03:39:18'),
(37, 'humayunchodhary@gmail.com', '287791', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:31:24', '2026-08-04 03:39:18'),
(38, 'humayunchodhary@gmail.com', '075362', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:31:43', '2026-08-04 03:39:18'),
(39, 'humayunchodhary@gmail.com', '980128', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:31:48', '2026-08-04 03:39:18'),
(40, 'waseema9544@gmail.com', '865833', 'io_access', '2026-07-28 02:44:16', NULL, '2026-07-28 02:34:55', '2026-07-28 02:44:16'),
(41, 'humayunchodhary@gmail.com', '629818', 'io_access', '2026-08-04 03:39:18', NULL, '2026-07-28 02:43:14', '2026-08-04 03:39:18'),
(42, 'waseema9544@gmail.com', '706941', 'io_access', '2026-07-28 02:54:16', NULL, '2026-07-28 02:44:16', '2026-07-28 02:44:16'),
(43, 'humayunchodhary@gmail.com', '790470', 'io_access', '2026-08-04 03:49:18', NULL, '2026-08-04 03:39:18', '2026-08-04 03:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'dashboard', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(2, 'analytics', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(3, 'complaints', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(4, 'verifications', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(5, 'reports', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(6, 'enquiries', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(7, 'io_records', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(8, 'dac_cases', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(9, 'court_cases', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(10, 'users', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(11, 'circles', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(12, 'offence_types', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(13, 'reference', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(14, 'profile', 'web', '2026-07-28 00:26:30', '2026-07-28 00:26:30'),
(15, 'forensic', 'web', '2026-08-13 00:00:00', '2026-08-13 00:00:00'),
(16, 'forensic_users', 'web', '2026-08-13 00:00:00', '2026-08-13 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `professions`
--

CREATE TABLE `professions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `professions`
--

INSERT INTO `professions` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Government Employee', NULL, NULL),
(2, 'Private Sector Employee', NULL, NULL),
(3, 'Business Owner', NULL, NULL),
(4, 'Student', NULL, NULL),
(5, 'Lawyer / Legal Professional', NULL, NULL),
(6, 'Journalist / Media', NULL, NULL),
(7, 'Bank Employee', NULL, NULL),
(8, 'Teacher / Academician', NULL, NULL),
(9, 'Retired', NULL, NULL),
(10, 'Other', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `received_from_options`
--

CREATE TABLE `received_from_options` (
  `id` bigint UNSIGNED NOT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `received_from_options`
--

INSERT INTO `received_from_options` (`id`, `group`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Government Sector', 'President Office', NULL, NULL),
(2, 'Government Sector', 'PM Office', NULL, NULL),
(3, 'Government Sector', 'Apex Courts', NULL, NULL),
(4, 'Government Sector', 'Ministry / Department', NULL, NULL),
(5, 'Government Sector', 'Other Government Department', NULL, NULL),
(6, 'Private Sector', 'Bank / Financial Institution', NULL, NULL),
(7, 'Private Sector', 'Organization / Company', NULL, NULL),
(8, 'Private Sector', 'University / Educational Institute', NULL, NULL),
(9, 'Private Sector', 'NGO', NULL, NULL),
(10, 'Private Sector', 'Other Private Office', NULL, NULL),
(11, 'Individual', 'General Public', NULL, NULL),
(12, 'Individual', 'Anonymous', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `received_via_options`
--

CREATE TABLE `received_via_options` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `received_via_options`
--

INSERT INTO `received_via_options` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Email', NULL, NULL),
(2, 'Telephone', NULL, NULL),
(3, 'Postal Service', NULL, NULL),
(4, 'Individually (Walk-in)', NULL, NULL),
(5, 'Mobile App', NULL, NULL),
(6, 'Online Form / Portal', NULL, NULL),
(7, 'Tipline (National)', NULL, NULL),
(8, 'Tipline (International)', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'operator', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(2, 'verification_officer', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(3, 'circle_incharge', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(4, 'enquiry_officer', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(5, 'investigation_officer', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(6, 'moharrar', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(7, 'reader_branch', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(8, 'ad_legal', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(9, 'dd_legal', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(10, 'additional_director', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(11, 'director_general', 'web', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(12, 'admin', 'web', '2026-07-19 09:07:39', '2026-07-19 09:07:39'),
(13, 'admin_forensic', 'web', '2026-08-13 00:00:00', '2026-08-13 00:00:00'),
(14, 'ad_forensic', 'web', '2026-08-13 00:00:00', '2026-08-13 00:00:00'),
(15, 'desk_forensic', 'web', '2026-08-13 00:00:00', '2026-08-13 00:00:00'),
(16, 'forensic_team', 'web', '2026-08-13 00:00:00', '2026-08-13 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(12, 1),
(13, 1),
(14, 1),
(1, 2),
(4, 2),
(5, 2),
(6, 2),
(14, 2),
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(8, 3),
(9, 3),
(12, 3),
(13, 3),
(14, 3),
(1, 4),
(6, 4),
(8, 4),
(14, 4),
(1, 5),
(4, 5),
(5, 5),
(6, 5),
(8, 5),
(14, 5),
(1, 6),
(2, 6),
(3, 6),
(6, 6),
(8, 6),
(9, 6),
(12, 6),
(13, 6),
(14, 6),
(1, 7),
(3, 7),
(6, 7),
(14, 7),
(1, 8),
(6, 8),
(8, 8),
(14, 8),
(1, 9),
(6, 9),
(8, 9),
(14, 9),
(1, 10),
(6, 10),
(8, 10),
(14, 10),
(1, 11),
(2, 11),
(3, 11),
(4, 11),
(5, 11),
(6, 11),
(7, 11),
(8, 11),
(9, 11),
(10, 11),
(11, 11),
(12, 11),
(13, 11),
(14, 11),
(1, 12),
(2, 12),
(3, 12),
(4, 12),
(5, 12),
(6, 12),
(7, 12),
(8, 12),
(9, 12),
(10, 12),
(11, 12),
(12, 12),
(13, 12),
(14, 12),
(14, 13),
(15, 13),
(16, 13),
(14, 14),
(15, 14),
(14, 15),
(15, 15),
(14, 16),
(15, 16);

-- --------------------------------------------------------

--
-- Table structure for table `rules`
--

CREATE TABLE `rules` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('04jlljmKWHEXdwKwx63km8AD5WUZ13jw1JBmYuTe', NULL, '79.127.134.242', 'NetworkingExtension/8624.2.5.10.4 Network/5812.122.1 iOS/26.5', 'ZXlKcGRpSTZJbTUxTmxVMWIzUXlZV2hwYmlzdmRYUmpPSFJOZVZFOVBTSXNJblpoYkhWbElqb2lieTl6UWxoSFVrOW9UMUZoYVhSUVdtNVBORlZCYUhGcmVGVlVibGhpTm5wclNFOXFkbnA0T1hWdlNIbzFTSGcyVjBwNVRXMVJTME5uVmt4VmJXOVpVa3hoZGpGeVRsVlplRlpHZVRSMFRtVkphVmx3UzFrNFIxbzBaemh6T0ZaTVl6VTNZM05RUlV0MVprOW9ZV3g1ZW1kRk9WWk1OWFZNZFhsQ05TOVBOM3AwUTFKbFp6ZGhkMGRKZVhKeFZVNDBZbGsxWkhORFdVTlJiMnBFYTBKVWVVMUtjbmc0VWtaQ05saHRMelJqZFdoTlNtODNTRWcyUVZWRU0xSTFTVEJIZG1odlRuRm9jamRGWlRSQlRqQkZhblpxUWxaVFdVbEZjR1pOUkdoak1UbGhWRWxpSzIxQmIwMXBRVDBpTENKdFlXTWlPaUkwT1dVMk56UTJaR0ZsTWpNMlpqbG1NakptWW1Zek9XVmhNVFU1T1RReE0yUm1Oak5sWXpVM1ltTXdZamc1T0RRME5qQmpNV0poWldKa1pXUmlPR1kySWl3aWRHRm5Jam9pSW4wPQ==', 1785926570),
('d9iZqj3eRPXN7mI1uDb2J13ZVwcoJCICXkWInZDh', NULL, '79.127.134.242', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0', 'ZXlKcGRpSTZJakJyYkRsc2JteEhOM3AwV1hvMU1sRldVU3RFUW5jOVBTSXNJblpoYkhWbElqb2lZVFV6Ums1eVFYQXZaVXhGU0d4Q2F6WmpMMVF5VDJoSllVbDVWbU5zWVZOWVZUWkJhMHhZVnpoU1MyMHdTMEZFVFZaU09ESnVVQzgyYWpsdmNFZHlRMWwwU1VreVpWa3pNbFZrU1RGeGQybFJTa0k1TjJwTFJHVkNPV041WVhkT1dFZHNaRWs0YWxSUE5tOWphR05QZEhOR2VuY3dUbEZVV0VKT1pXcHlWMFUxVVVjd2JGbHNNVXBqVWpoT2FERXhXVXhsYWxoTFVtazBTMmhPYVdKSWJFUTFjbHBDYW1ORmQzZEpjbmxDTHpsYVpXbzBSV053UjFSa2FXMUVNbGc1VnpGNGJWRlpZMjR5Wldoc2FuVjRUR1pMV1cxUVVUMDlJaXdpYldGaklqb2lZakV6TnpOallUZ3dZalZrT1RVNVl6VTRZVEprTXpFNU16YzJOMk0zTnpBd09EZ3hOemRtWTJFeFl6QXlZbVkwWXpJeE9XRmxNakkzTnpoaE5XUTVNeUlzSW5SaFp5STZJaUo5', 1785926570),
('DKCGyoFdGdWNnghY8ttf98n705sLYonVyCrNuOlA', NULL, '79.127.134.242', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', 'ZXlKcGRpSTZJbXBZUlZsMk5GQnZiVXRRVTAxb1EyMUtRbmR6WlZFOVBTSXNJblpoYkhWbElqb2lkRUkwWmtWNVRFWmhhaTh2U0hBNFFVcHVkVnB1YlVOcmR5OWFTREpRYlhObE1UTXhUVXRpVEc5TGRETnFlbVZoVWtSNFVWYzVZek14V0VaTWVEUk9NREpTYjNsUlpWTm5PVWRHVEZjeVoweHZVMlZOZVRob1J6TlZVVnBTWm1OV2ExRmFVRGd5Y2tjcllqUkxjako0TmpkVlZtVlFOMnd2U2l0dWVWQlJSM3B0VWtSNE9GbEhjVFJqZEVoWlRteDJZVTVYV21wRGRtRldheTh5UTI1MGMyRTBTa292U0ZaQlUyZzNibmxqSzFCck5GRk9kRmhLYkhwTlJFaDJNMjR5ZVZneVVUaEROMU5WSzJKS1JERjFaSGswYkRGdFFUMDlJaXdpYldGaklqb2lObVV5WW1SalpHWTBPVGxtTkRBNU16RTVPVEk0T1dWaVpHUXlZMk00Wm1Zd01UZG1PRFZoTldaaFpHRmtPVEl5WlRObU1tSm1OR0k0Tmpsa1pHWTVaU0lzSW5SaFp5STZJaUo5', 1785926562),
('DnIB9wgmjFwK56I7E6L3DxQqE4bQs8mwhycJQUKS', NULL, '34.32.247.234', 'Scrapy/2.17.0 (+https://scrapy.org)', 'ZXlKcGRpSTZJbGcyT0VwcmNIUjZjSEZhVTI1R2NsSlBRVUZhU0ZFOVBTSXNJblpoYkhWbElqb2liM01yUlROVFMwVlBPR05HVG1sNlpIbHRSVUpGVEc4dk5ubEhUa1p5YUhJMGRYcERhRXQ0ZG1SNVZUWTFOMFZMTm5WQ0swSnVVMGRSYUc5V2FXUm9jRmxaVm1aM1VYVXdTM0psTUZseVdEZHhVbFZpV0c5UFpHUmpSVVZ5WlVWVlEwNDRaMWxEVTFSSFNYcHNRMWxuTVU5dWFXVjZVSHBaZFdvNWRHTlBiRWh4ZFdsb0x5OTVTMHRTU2xWV1RtbHlka1p5TTJ4eU5FWXJTalpFWlRNd1NHNUhaV2t4ZG1wdU9HUndVVFZNU1RoRFdXbDFOeXRvUlVWVWJrcFRkREZoYm5wYWNXUlBXVEpGYXpKTllsTXlPVEZqTHpCT05uaGhNM3BqUzJremFIVlFiSEZ1TVRSMVVsVjBZa3BrY2pFeVowVkJlRlpLU3pCSlRtWnJNbU5uZUdKQ1JXSklaRXh5YUcwdlZXUjRVM05CYkRkQlpXeERXREJJU1hkVlNtUk5SRVZzTkRGWGFFUkJPSFZpWjFCRWFUWjVZVE5PWWxkT1RGbGlSVGRPVkZFeGVuTjFPVTlwTnpnMFEzSTVPR3RQWkRNdlFubG9hVlJPVTJSTU56bERZM0p5WWtrdlpUa3ZhM0pMVVdGdE5tTkdZVWxaYlhjNVVtNHdWM0ZDUVRFdk5WSjJNSHBDUTBOellXaHRTVGRLYVRGNVZYTkpRV1ZhVXpsYVdESlpkRUZLVlhkT2EzSnJiamRGUmpreFpEbHFUekZYVVZKM2JsTjJkVUpKT1VaeFVrSkxkVXBpWkZacmJsbHlXV3N6VkRCWVlTODVjbEpLVlVkalVYQndUREZaUlhSSFlreDViVWhEUjFkRWJtSkJPRk5DU1M5cVN6VjVjWE5VVlZSMWRVWkxVbVZzYW1KWmFrUnJRMmxxVmtsSFkyRTFkV280UkROMVIwOVhURWh6VHpBeFN6VlBibFl2TjJvNVJVOXZja0Z6ZGtGSGEwWjJlRFJqUzI1Q2RHMUlSV0ZoWlhWVFIyWkphM1pJVTI5ak4xbHNWMFZMTVVkNVJrNHJXRmxIVXpOcmRXaFZhRVpZTWtwaVNsaGFOWHBTYjJnelRuRkxlalZUTlhweWNXUkdUaUlzSW0xaFl5STZJbUZsT0dSbE9EVTROVFJqTTJaa1l6QTVaVE0zT1RBMU9UUTRPVEV5TldWaE0yUXlObU16TTJaaE56STFObU16TmpBMk5XTXhZVFZsWm1KaU56SmhOekFpTENKMFlXY2lPaUlpZlE9PQ==', 1785948808),
('drZSCam81vbaXm4gIpMti0ltVAKj6C1IQybrfn9m', NULL, '167.99.119.218', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJa05FTld3eVNGTkZiME52VFhremNsSXdZMWxEWW1jOVBTSXNJblpoYkhWbElqb2lSbVIxVXpGTmJHd3dVRU0yWVZFMmJsbFdia3RvVFVSS09VeG9TVGQxV0hOcmVUQnpTMFlyTkhwVVpIZGlXVU14ZDFSNlMyUnVORFF6WWtrMmFHNUVTRlkxTUZWeksxRTNTWHB6YkU1WWEzaElaSEpUVm5wR1pqaHdXa3BoVUd3eFFrVmtURmN3Um5oM1ZqUkhaalJqU1c5WVFtUnlhVUl4U0Rsb2NGa3liR3BFU21WRlMzQkNaR0k1WkVWSmVUZHNkekV2UzIxSVZ6QnhWeXR4TkVwME4zUlNTR1F5T1VWMllYUlNkREJRVmpablRXVlVUV05oY3pKbVJuRlVZM0pvSWl3aWJXRmpJam9pTWpJM1ltVmxOVE00TjJFNFl6TmtOV1ZoTWpjellXWXlOalpoTnprNFlqbGtZMk5rWWpWbU1UY3paR0V5Tm1ZeU9HVmhNMk14WlRobE56QmlZak01TXlJc0luUmhaeUk2SWlKOQ==', 1786004964),
('DZ2B0munmPWYoHpCcZRZfETrDPBtKUb66FuJcOWg', NULL, '34.90.229.81', 'Scrapy/2.17.0 (+https://scrapy.org)', 'ZXlKcGRpSTZJazlRTVhGSVpqUm9WemhCTkZneUwxVm9jbGxXUTJjOVBTSXNJblpoYkhWbElqb2laekUzWVdzNEwxVkdRWGhrT1VKelNIWkxabGRTYm1aSU4zVkJkR2R4YjNWelFsQjJWV1JYVEhSNVJrWXpZblZIZVZOaEsyaDBRa3RSVjI1YVNXSlljV3Q1UmxaWVdsZElNMFZOYkhkblZITXdZMVZwV0V0WVdrWTNObWgyTkZvMmNXUjNTM292YUM5a1RVOTJkemg0YTNkcE9USnNORUkyY2xZeE16TnRSbGhGTWtWQ1YzTTNjSEJQVFUxdFRHdE5XRzVRWnpOSmNXOUhVMGQxTlhsblRtSlZjSEJHZDJjemMySnFXRzk1T1VNMGFHTkZSbU5WY2tsamFGcDZSWEIwU0hsdlpXOXNUVEJvTTBOUlkzWlVLMlkwYlhkT1RrNU1VRFZNU0hNNFlsSTFhM2xTT1dNMU5FbHRPRkZyTVc0NU1HTmxTemxSUm1rdlVFWTBSMFJGYTFGbVZWUkpOekJ1WlZaMVFtaEJkR2h2TkdoMlkyeG9kRFF5WW1aU2EyeHViM0JaWnpVeFlWUkJNRTV2U0hoVE5sWnNVVTlVVDBGWGNWSk1NWEJKYzNkdGFIbDNTRVJtTTAxWlZHcEpLMk5oV0ZOQ1pXTnZlazFCVGxkWFRuWk1hbXR3UzB0WlJWTlpUWFJOYkZsS00zRjBZVmhvWkRFMGNYRmtNR0pGVW5OaVpYUm5XWGRSTVd0bVZVODVLM05XYjFOcFN6ZE9kWE5pZUZCWmFHUkRPSFJCUVVZelMySmhPSE51ZGpOb1MzZEtWRGhrYzJGclRUSXZSMHhoZFVsbEszcFRhbWxHWVVKNlQxb3ZNVVo0YUhWUVExQkxNM3BIV1ZwMFJXZFNablJtUmxSck4xWkJiamh3VWpWSmIwMW9TbGx5UVVwcmIwNTFhVEJqWVZKTFluRkNNbXgyTVdSYVlWY3lMM0JVZVdoNFowRnFWM05zT1ROT05USTFlSFJ4VlhsRkwwcGFiamdyUmxOVlEwTmFRVzQyY0Vrd1RVaEJNRm8xTmxNdldHSm5PVVJXY21kelpsSXZhMUIwZWtsWmNsVlRVVVpuWmtGRE4xb3lhWFpoVG5CeWJtaE1UVXh5ZFVaa2NHbGxTMDk1ZFhCS09WUnphVVpWVmxVM1lsYzFUU0lzSW0xaFl5STZJamMyWmpobVpEQmtZbU13T1RSaFlUY3lPVEJqWkRVeFpqQTRNMlF5TldNNFl6WmtObUUxTVdZeFpEaGxPRGM1T0RGaFpEaGtOMlZrTnpOaFptUTFZamdpTENKMFlXY2lPaUlpZlE9PQ==', 1785948782),
('eUApE2VX7zsDjYfK65esv8NkqDg5BldCmFtg7sxg', NULL, '79.127.134.242', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Safari', 'ZXlKcGRpSTZJblJSVUU5Q2RVY3pMMEUwTDFnMVlVaDFiekpPTVZFOVBTSXNJblpoYkhWbElqb2lWbmxNT0hsMmNYSnlka3BPTVdWbVprRnBjVEpyWkRkd01GTlVZbWRuWXpablNrUlFWV2MyUkVwNFNGWjFhVEpGTW5RMmRXdDZObkZYV0VVemJEWk5VazRyYVZjeVRXSXZWSFZzYmxCaVVuTkpWeko0YjJWWWJEZE1jMUpyV0drd2VtTjFjVzFuVkZFeGNHRlpPSGRHYTNkbk5HTndWalJKV0U1V1MydDBka2cxT1RSclpuZDNWVEJ3VjNrMmRVbzFjRkl5YTNVNVJVMXhjMGx4T0Rsb1FUaFpWSEYwYW0xeVJDOU1Wa1JtYjJJMGVXUXhUVUkzZVRJdlVHVmpNRVpHV0VaRmIyNU9ZMWxNTVhKVVJ6UmljWE5SVGxReGVXa3haVW8yWVZKaFIzRlFObEZZWW1KS1FXMVdZejBpTENKdFlXTWlPaUkxWkRKa09HSXlOVEkxWlRjMVpqQTVObVZqWXpsbU1HSTBOelppWkdVelpqYzFNRE14TmpNM09HVm1ZamhtWWpVNFlqWTJPREUzWVRabE1qZzBOV1ZoSWl3aWRHRm5Jam9pSW4wPQ==', 1785926572),
('ktjmc9vCxn6QdJqVp17RVUrgOKTT1JedohMXk3t7', NULL, '79.127.134.242', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', 'ZXlKcGRpSTZJakY0WW1rNVMwUlJObWxhYjAxR1FrOVRTalpLYkhjOVBTSXNJblpoYkhWbElqb2lLMk16Umxod2JGTTJaMmRHWjB0dGFVaEliVkJIZUVsTk5EQlpZbEZXVkc5RVpqQTVjMDFEU0haMFNrTkhSVzFXYW5CeFdHVnFUMHRqYjFFMVoyOTRkMFJGZFZoclUwaGlkbUpWVmpSNFUwdG1aVU5LWkdWa2RHUXpXVXRwV25KVlJ6Qk5jMUZJUjFseGNVMVVWamQ0WldJd1V6Qk9VREJpVGtsa0t6QXpRMGhGWmtveWIxWXlUbkkyYlVodFREVlJWVEJOTTNvcmVrOVlVRFk1VjFOaFNGZFhZbFZwWWxadVNWQnZWRWhSWTA5VFJFNWxWU3RpYVV0NWRWWjRaWE40ZFVoMGFXMTZVMjFsYlRNeWRXVldOSGR3VWtwTFp6MDlJaXdpYldGaklqb2lNekEzWldOaVlqWmhZamRpT1dGaFkyVXpNRFl6TVRjM1pqVTBNbUZqWWpaa1pEZ3pPR05oTkRrM00yTXpOelJtWm1Kall6QXhaV1psWldZeVlXTTJPU0lzSW5SaFp5STZJaUo5', 1785926570),
('lzRst3uWbKfM3BeqlSqejfcXerlbCiANMTuRy1lg', NULL, '167.99.119.218', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJbE0yYldad05rUjVNR2hSUmtseWN6TXpjM2d5YjBFOVBTSXNJblpoYkhWbElqb2lSMjFoVkZGQk5WTk1WMHR4YVU1cmFHMXlkbEpoYkZkTVpubFFSM0Y1V0c5SlNraHJVelZXUTJKdlJDdDBaV1ZZWVdZd1luYzJSR3BaYkdsUGRYUlRVVFZOY2xWS2JtZDJUbTV1WVRKRGFVdHZhRUZxY0dOV1RHMXpNMVIwZGt4TVZsUkJkVFl4WkVJeVlrdFdRakpyTkcxMksyTkRURWh6YTI5elNqZExiRlYyY2k5VU5YWlJVVGRuTlhneVFWSkdNV2RMWXpCdlZGQllVMmh6U21relEwOWllVWhzT1VoNmFXc3dibTFMVkdONFZDOUlSMWR6ZW1JMVEzbExTRk52SWl3aWJXRmpJam9pTXpNNU1qSm1ZVFl6WWpabE5UZGhOR0U1TXpjelptUmtPV0U0WmpSak9XTXlPR013WWpnNVpEazRaV0ZsTTJReFpUZGpZV0UwWWpVMU1XUTVZakV3TXlJc0luUmhaeUk2SWlKOQ==', 1786004963),
('p0R41ldJgYvr18RUM5FXG1Z0nVOUE3r8jb0YrPCL', NULL, '79.127.134.242', 'NetworkingExtension/8624.2.5.10.4 Network/5812.122.1 iOS/26.5', 'ZXlKcGRpSTZJa3BtZURWTE1VY3hPREZ4WkVwa1kwdERRbkIwWVhjOVBTSXNJblpoYkhWbElqb2llVmsyVGxOYVZGQkJRbU5HYmtoVmNVTjZVbUpRVmtoMlZWazRSWEI2VEZwdkswSk1SMFl6UVVNeVdGUkVVa2R0UWs0M1kzVklSMlpFWlZoRVIyNUZLMlppY0RWbGJVWTFLMGx0WVdsaVFXUlFaMFJxZFRaT2VEZE5TRmw2TUdOTGNXRkpNelZETmtzM05XTk5WREJuY1d4aFZVczJRbEl5UjBWaU1VRjZTSGhWTjAxTlYySm9hMmh2TmtaRVlUVmFkRlZ5TXpFd2R6WmlXbnB4VDAxSGNXRlpXa2xPTlRsVVRITnhlbVYxUjJjMldHTmxUV1pvVTBKeFJqZHBOMVJYUTNSaGN6Um9ObTV3Wkc1Mk9XZDFaVTFDVVdaWVpsUkhheTgzVURScGRUQnZSa1kxVUdGdWJqUTRka2czT1hSbFprMWtPV3RzZEV3MVdtVXdOMEZzU3lJc0ltMWhZeUk2SWpBeFl6UmhOV0ZqWVRNNFlqVTFNekJrWlRJeFpUWmxNREppTkRWbE9EaGtNMk5sWXpNek5qSTVaV0k1TkRjelpHVXhOakUzWmpjeE1XUTBORFZpTlRVaUxDSjBZV2NpT2lJaWZRPT0=', 1785926570),
('REwibcoiA4JwCUUHFndBb1KvITkDbA5h33iCh7r7', NULL, '79.127.134.242', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1', 'ZXlKcGRpSTZJa3RMYmt0TVl6bHlTek5xTVc5bmFFcHFPRTlNT1hjOVBTSXNJblpoYkhWbElqb2lia2xZTlU5cU1FdFdUV0ZvYlZGcEsyRk5VSHB4YVcweGRIUnJObGxpVkVzMVRXOUJTRFpXV2xwb1drdFFUME53VFVaU1YwMU5WMXBWTkdORGFtUk5kM1U1Y0U0MWRsazVPVWRoVmtGM2JWcDRNeTltY2sxdFIzUjBkR3gyTmxsTlNWWnpWekp0VlhobFRVTlVPRkIxYzJoT2JXMVhTR2hhVms5alpWUXZhRTF0UzFoV1RFUldPVVJaZERJdlNGbFhWbE5PZFdwUFpXczVWMk5qYWpOVldrdDNTemxsYWxoRk5tOVFUMnRGVDNBd05ERnBablJxYzNkWmRrZE9kWFZyVjFVMUszRkJSRVpuWldkRU0wSmhjMVZzWlRaYVUyRk9XRVJaWmt0ek1XSjJZelE0VXl0eFRXa3hZejBpTENKdFlXTWlPaUk0TldSaFlqVTRNamt4WkRZeFptSTBOV1l6WVRGalpXTXlOakppTkRreE0yWTNPRGhqWW1NM04yRTBabVZpWldRMU5EWmtZVFkxT0dVellXVmlaR0poSWl3aWRHRm5Jam9pSW4wPQ==', 1785926562),
('rZJ2a42zUeuWHKI2tyEKWzBQ7CX2fKEEw6pXdLyi', NULL, '34.32.247.234', 'Scrapy/2.17.0 (+https://scrapy.org)', 'ZXlKcGRpSTZJakUxV0VSa1RsQjBiblF4TVZaYVVGaHNSRVZYZDBFOVBTSXNJblpoYkhWbElqb2lLM2xLWkdOVFNEQTFWemRKVlU1YVRUSk5hazltWTFwT2NsTlNTRnBwZEVGMlVWbzRUemg1TTFwNU1VOWxjVGxKVEdvMlFtdDNiMEoxY3pCWE1XWnhUVGx4VFRkUWFGTTRRa2RhVlhkWVRYZzJkSFpHVW5wdlJrSnRNbkJFYjFaVU1XcFZjalJPZVZWR2QxTmxRMXA2YlRKVU9GQnRkMWhQTURCSGNWcFFlbE0wUWtVMVJWcEVSR2xHT0dSdGJWSllLMnBRYkdFNVJ6bDRXRFYzYUdKTlIwWm1ZaXQyVldaRlYzVk9kVkF4UTB0MlEwZHVaV0ZsWXpFMlRtTlpibHBNSWl3aWJXRmpJam9pTldGalpEZzNOemxqWlRsa1pUWTFNVEU1WTJWaFpEUXdaalZpTWpCa1pUZ3pZbVZrWmpobE56SXhZMlEwT1dFNE5qSmlZbVl3WVRCa01UVTJPV05sWlNJc0luUmhaeUk2SWlKOQ==', 1785935473),
('X6vKnzovuwQ49j5s82NtfVA5CowcicTxUB9vimSL', NULL, '34.91.213.89', 'Scrapy/2.17.0 (+https://scrapy.org)', 'ZXlKcGRpSTZJbkp5UlRabWRUSnZRbVJZTm1veVpVRkJUa2hLV1ZFOVBTSXNJblpoYkhWbElqb2lNbVpVUnpoeWEzRjJhSFZVTkhGamJURlljREJLVGpacVdISmliVU0yWmtoTGF6RktXSFEzTDBSc2NuRmxRVmczU1Zjd1VrWndLM2xWUjJJelRVTlFaa05LZW1ndk1UVllRV1ZDVjNaTVkzRXJWeTkzVERkYVltNUNjSEoxWkc1UFpHaFRVM016TUZGVWN5OUZaRWxHTUd0WlVETTBjSGQzT0dGV1RrWktaak5PWVhkaFNUVkxSMnRwWlRkaGVGazVjVkp0YzB0bFkwMWlabmxVV0hwSmVrNHZZMWwzUldKVVMwRldhSFZZY2tSWmNuUjJNM0J6Um10MU4yODBWR3N3WVRkTVdEaE1lak5PUW14Uk9YTnJkRkJZVGxsNlVUMDlJaXdpYldGaklqb2lNbVppTldReFlqZzVORFEwTURsaFpXWmtNV0l4TVdSbVlqRTNaakUwTWpOaFltUmpPR00yTXpFMk1UVXpZV1U1WlRCbU5EVmlZVGhsTm1ObVpXTmpZU0lzSW5SaFp5STZJaUo5', 1785935417);

-- --------------------------------------------------------

--
-- Table structure for table `sops`
--

CREATE TABLE `sops` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `effective_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `circle_id` bigint UNSIGNED DEFAULT NULL,
  `zone_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `designation`, `email_verified_at`, `password`, `remember_token`, `signature`, `created_at`, `updated_at`, `circle_id`, `zone_id`) VALUES
(1, 'Operator', 'operator@nccia.gov.pk', 'operator', 'Assistant Sub Inspector', NULL, '$2y$12$8aWRyR1n8qtuQs3HabaDSe/MCMI.5KohajItrFKBB3Ry/cWzOcyYa', NULL, NULL, '2026-07-17 05:48:16', '2026-07-17 05:48:16', 3, 2),
(2, 'Verification Officer', 'verification.officer@nccia.gov.pk', 'verification_officer', 'Sub Inspector', NULL, '$2y$12$DU6Jl1b9iIO5MulDaL43pOkHcX7fVBHcOZMbG4MO15R7BBIaWcFhy', NULL, NULL, '2026-07-17 05:48:17', '2026-07-28 01:35:50', 3, 1),
(3, 'Circle Incharge', 'circle.incharge@nccia.gov.pk', 'circle_incharge', 'Deputy Superintendent of Police', NULL, '$2y$12$ApDA9WoNB2jlucK0CZ6wzuXaLxehOuhfIkD7ksQoJ/SnOFHF1yKda', NULL, NULL, '2026-07-17 05:48:17', '2026-08-04 02:46:18', 4, 2),
(4, 'Enquiry Officer', 'enquiry.officer@nccia.gov.pk', 'enquiry_officer', 'Inspector', NULL, '$2y$12$n6qEAXGNQiQiN8V4vZvrguYGHRqdMcSJCoKCAETFbyjHk7MeF5A3e', NULL, NULL, '2026-07-17 05:48:17', '2026-07-17 05:48:17', 4, 1),
(5, 'Investigation Officer', 'investigation.officer@nccia.gov.pk', 'investigation_officer', 'Inspector', NULL, '$2y$12$G6QzZccX/wAJolxJVBaG..ADH3r9x.LstSnVzvZj9hvxPda.jdwgC', NULL, NULL, '2026-07-17 05:48:17', '2026-07-17 05:48:17', 4, 1),
(6, 'Moharrar', 'moharrar@nccia.gov.pk', 'moharrar', 'Assistant Sub Inspector', NULL, '$2y$12$AW1rY8I/ua3W4JqD6gx7Xelg429O6UWaKbFmFgUHzBoSAXH0tj8e2', NULL, NULL, '2026-07-17 05:48:17', '2026-07-17 05:48:17', 4, 2),
(7, 'Reader Branch', 'reader.branch@nccia.gov.pk', 'reader_branch', 'Assistant', NULL, '$2y$12$TSeBhtRx0XufYv4sRLPMXeFOPII1HQklynzgq8yS4m/EZywAyHZba', NULL, NULL, '2026-07-17 05:48:18', '2026-07-17 05:48:18', 4, 1),
(8, 'Ad Legal', 'ad.legal@nccia.gov.pk', 'ad_legal', 'Assistant Director Legal', NULL, '$2y$12$AN3cSMtF4KlIaxnjS5557OOYe.WmH2d67.muu2tCf..7.kaa0OGsW', NULL, NULL, '2026-07-17 05:48:18', '2026-07-17 05:48:18', 2, 2),
(9, 'Dd Legal', 'dd.legal@nccia.gov.pk', 'dd_legal', 'Deputy Director Legal', NULL, '$2y$12$ISzoxBllLgxYoX45R627eeNSYSnwkpTEK9CLKMlekwpRGTmY7wzXK', NULL, NULL, '2026-07-17 05:48:18', '2026-07-17 05:48:18', 3, 2),
(10, 'Additional Director', 'additional.director@nccia.gov.pk', 'additional_director', 'Additional Director', NULL, '$2y$12$w29Q9nEN0JPFfAEimc3xjONrLo1Fd5vVI07SfUgSChJ9mcn8Jr.gC', NULL, NULL, '2026-07-17 05:48:18', '2026-07-17 05:48:18', 1, 1),
(11, 'Director General', 'director.general@nccia.gov.pk', 'director_general', 'Director General', NULL, '$2y$12$DI.pIzK6W5/rABlOFxTxKeRXcLOXJCLhcaO88U1YbW3BREEz76US.', NULL, NULL, '2026-07-17 05:48:18', '2026-07-17 05:48:18', 3, 2),
(12, 'Admin', 'admin@admin.com', 'admin', 'admin', NULL, '$2y$12$jOGKj3MoQuQ5K6AMo1WOmeNsOP.3kY/dCTG11Blwr0MTOyQbixHSm', '1EzmIL0pow8mDBIP7dITgFEyWYD0qkHq5mzwS16U8YkuzffUU8sh58ZmI4gt', 'signatures/A7UXk9CfCQbrxhDdmd2XfllvjE9EOOZkdX1B1bJs.png', '2026-07-17 05:48:19', '2026-07-27 23:13:41', NULL, NULL),
(13, 'hamza', '26011@nccia.gov.pk', NULL, NULL, NULL, '$2y$12$iD5sq7tSLbj0b0LP.qAPYusNlhs4WTIzpmL245ApoffI3of7wYani', NULL, NULL, '2026-07-19 08:20:44', '2026-07-19 08:20:44', NULL, NULL),
(14, 'hamza', '20611@nccia.gov.pk', NULL, NULL, NULL, '$2y$12$s5zZANW6nwljRR2bwfpSIOdFK5SR68RXxnOnxta1xaL5.tlK56Zoy', NULL, NULL, '2026-07-19 09:49:57', '2026-07-19 09:53:50', NULL, NULL),
(15, 'ali raza', '2608@nccia.gov.pk', NULL, 'sub inspector', NULL, '$2y$12$nhYXfy0XP8k/AZfxE4k7YOEgcXfUXwPVuUlCQz6kE9Y44B9q4tena', NULL, NULL, '2026-07-19 09:52:08', '2026-07-28 01:39:23', 1, 1),
(17, 'arslan', '3006@nccia.gov.pk', NULL, 'sub inspector', NULL, '$2y$12$EVPy3ONvP9Yf2P/qHj3Zue3JvPQHA2pWkjbLQMVcXeDtBNnA82cKi', NULL, NULL, '2026-07-24 03:03:50', '2026-07-25 04:01:46', NULL, NULL),
(18, 'Testing', 'testing@gmail.com', NULL, 'abc', NULL, '$2y$12$e2dAl1Q3h6PUDBLQZbjLAOCgsLJVeqB4XXFmPxb9hzPQcr/nlEzMO', NULL, NULL, '2026-07-24 04:54:23', '2026-07-28 00:42:27', NULL, NULL),
(19, 'ahmed', 'ahmed@gmail.com', NULL, 'aditional director', NULL, '$2y$12$yNc3P5AXWn1Yb0xgr9FzWODcFwI1Yi5oPTZ6ywkUMLR821fkYB5by', NULL, NULL, '2026-07-25 04:34:07', '2026-07-25 06:28:20', 1, 1),
(20, 'mustafa', 'mustafa@gmail.com', NULL, 'inspector', NULL, '$2y$12$LszhtlDA.VcIGnog11ssGOD1RC/wqNogQuM9jyIwo8MC8dE7fTfhq', NULL, NULL, '2026-07-27 23:26:28', '2026-07-27 23:26:28', 1, 1),
(21, 'aslam', 'aslam@gmail.com', NULL, 'sho', NULL, '$2y$12$BW0E1LF5Of6ODiuql0NuQ.Ee4mCE6z3geScN6HFgyEffsEzqgjdbu', NULL, NULL, '2026-07-27 23:30:27', '2026-07-27 23:30:27', 1, 1),
(22, 'ali raza', 'humayunchodhary@gmail.com', NULL, 'sub inspector', NULL, '$2y$12$d/PvojTeopk2Zr3GuO6LTeT6UkHq/ZPBs0jQd1WWpGF8Qxyc.rqeS', NULL, NULL, '2026-07-28 01:42:31', '2026-07-28 01:57:32', NULL, NULL),
(23, 'ali', 'ail@gmial.com', NULL, 'sho', NULL, '$2y$12$HiV5UtTsbwdLcZREc2AuTOcE3avcMw3PTeaUnqREKRwLrami17UOO', NULL, NULL, '2026-08-02 07:03:45', '2026-08-04 03:07:05', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_manuals`
--

CREATE TABLE `user_manuals` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audience` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verifications`
--

CREATE TABLE `verifications` (
  `id` bigint UNSIGNED NOT NULL,
  `complaint_id` bigint UNSIGNED NOT NULL,
  `verification_officer_id` bigint UNSIGNED NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `recommendation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_text` text COLLATE utf8mb4_unicode_ci,
  `closure_reason` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `merge_complaint_id` bigint UNSIGNED DEFAULT NULL,
  `transfer_department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `assigned_by` bigint UNSIGNED DEFAULT NULL,
  `transfer_circle_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verifications`
--

INSERT INTO `verifications` (`id`, `complaint_id`, `verification_officer_id`, `status`, `recommendation`, `report_text`, `closure_reason`, `merge_complaint_id`, `transfer_department`, `priority_type`, `assigned_at`, `submitted_at`, `approved_at`, `completed_at`, `created_at`, `updated_at`, `assigned_by`, `transfer_circle_id`) VALUES
(3, 38, 2, 'assigned', NULL, NULL, NULL, NULL, NULL, 'court', '2026-07-06 10:48:21', NULL, NULL, NULL, '2026-07-15 05:48:21', '2026-07-17 05:48:21', 2, 1),
(12, 35, 15, 'assigned', NULL, NULL, NULL, NULL, NULL, 'regular', '2026-07-24 08:02:27', NULL, NULL, NULL, '2026-07-24 03:02:27', '2026-07-24 03:02:27', 12, NULL),
(16, 26, 15, 'assigned', NULL, NULL, NULL, NULL, NULL, 'higher_authority', '2026-07-24 09:39:22', NULL, NULL, NULL, '2026-07-24 04:39:22', '2026-07-24 04:39:22', 12, NULL),
(20, 237, 2, 'assigned', NULL, NULL, NULL, NULL, NULL, 'critical', '2026-07-28 06:35:06', NULL, NULL, NULL, '2026-07-28 01:35:06', '2026-07-28 01:35:06', 12, NULL),
(21, 238, 2, 'assigned', NULL, NULL, NULL, NULL, NULL, 'normal', '2026-07-29 07:38:08', NULL, NULL, NULL, '2026-07-29 02:38:08', '2026-07-29 02:38:08', 12, NULL),
(22, 238, 2, 'assigned', NULL, NULL, NULL, NULL, NULL, 'normal', '2026-07-29 07:40:12', NULL, NULL, NULL, '2026-07-29 02:40:12', '2026-07-29 02:40:12', 12, NULL),
(23, 239, 2, 'assigned', NULL, 'hhadd', NULL, NULL, NULL, 'high', '2026-08-02 11:41:43', NULL, NULL, NULL, '2026-08-02 06:41:43', '2026-08-02 06:41:43', 12, NULL),
(24, 240, 23, 'assigned', NULL, 'urgent', NULL, NULL, NULL, 'normal', '2026-08-04 07:31:53', NULL, NULL, NULL, '2026-08-04 02:31:53', '2026-08-04 02:31:53', 12, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `verification_approvals`
--

CREATE TABLE `verification_approvals` (
  `id` bigint UNSIGNED NOT NULL,
  `verification_id` bigint UNSIGNED NOT NULL,
  `circle_incharge_id` bigint UNSIGNED NOT NULL,
  `decision` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recommendation` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `closure_reason` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `merge_complaint_id` bigint UNSIGNED DEFAULT NULL,
  `transfer_department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_circle_id` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verification_reports`
--

CREATE TABLE `verification_reports` (
  `id` bigint UNSIGNED NOT NULL,
  `complaint_id` bigint UNSIGNED DEFAULT NULL,
  `tracking_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignment_date` date DEFAULT NULL,
  `verification_date` date DEFAULT NULL,
  `victim_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `victim_father_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `victim_occupation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `victim_gender` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `victim_cnic` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `victim_country_code` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `victim_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `crime_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `crime_description` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accused_known` tinyint(1) NOT NULL DEFAULT '0',
  `accused` json DEFAULT NULL,
  `recommendation_short` text COLLATE utf8mb4_unicode_ci,
  `recommendation_full` text COLLATE utf8mb4_unicode_ci,
  `recommendation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `closure_reason` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evidence` json DEFAULT NULL,
  `signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inquiry_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `case_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verification_reports`
--

INSERT INTO `verification_reports` (`id`, `complaint_id`, `tracking_no`, `assignment_date`, `verification_date`, `victim_name`, `victim_father_name`, `victim_occupation`, `victim_gender`, `victim_cnic`, `victim_country_code`, `victim_phone`, `crime_category`, `crime_description`, `city`, `accused_known`, `accused`, `recommendation_short`, `recommendation_full`, `recommendation`, `closure_reason`, `evidence`, `signature`, `inquiry_no`, `case_no`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 6, 'ISB-C-0006/26', '2026-07-08', '2026-07-17', 'usman ghani', 'afzal ghani', 'ceneter', 'male', '99053-4159529-5', '+92', '0381142080', 'data_breach', NULL, 'Alik Ghund', 0, NULL, 'wweqeqweqwrerwerwerwerwerwrwerwerwe erwerwerwe werwerw', 'erwerwerwerwerwerwerwe', NULL, NULL, NULL, NULL, '0311610399', NULL, 12, '2026-07-17 05:57:51', '2026-07-17 05:57:51'),
(2, 17, 'KHI-C-0017/26', '2026-07-17', '2026-07-15', 'usman ali', 'jawad', 'cmd', 'male', '51894-6154518-9', '+92', '5298634892', 'child_abuse', NULL, 'Islamabad', 0, NULL, 'efwefwef wefwefwefwfwefwef', 'fefwefwefwefweffwe wefwefwefwefcsdfwefwefweeeeeeeeeeeeeeeeeeeeeeeesdfsdffffff wefwefwe', NULL, NULL, NULL, NULL, '0311610399', '0311610399', 12, '2026-07-18 03:37:58', '2026-07-18 03:37:58'),
(3, 17, 'KHI-C-0017/26', '2026-07-17', '2026-07-15', 'usman ali', 'jawad', 'cmd', 'male', '51894-6154518-9', '+92', '5298634892', 'child_abuse', NULL, 'Islamabad', 0, NULL, 'efwefwef wefwefwefwfwefwef', 'fefwefwefwefweffwe wefwefwefwefcsdfwefwefweeeeeeeeeeeeeeeeeeeeeeeesdfsdffffff wefwefwe', NULL, NULL, NULL, NULL, '0311610399', '0311610399', 12, '2026-07-18 03:44:39', '2026-07-18 03:44:39'),
(4, NULL, '— Rizwan Asghar', '2026-07-16', '2026-07-23', 'ali', 'ahmed', 'xyz', 'male', '56466-4864448-6', '+92', '3432911285', 'cyberstalking', 'i am showing', 'Multan', 0, NULL, 'i am ready', NULL, NULL, NULL, NULL, 'signatures/6C3jqoPUguFa15j8iJEMxzWqEaOhlQYHvNK9h7cJ.png', '234234', '234234', 12, '2026-07-23 05:41:16', '2026-07-23 05:41:16'),
(5, NULL, '1/26', '2026-07-23', '2026-07-25', 'hjh', 'dydy', 'ddyrd', 'male', '00000-0000000-0', '+92', '9898898988', 'cyber_terrorism', NULL, 'Islamabad', 0, NULL, NULL, NULL, NULL, NULL, NULL, 'signatures/BDffLMakT8alT7DGsqOB7GaWphX544MmX6ZRah9h.jpg', '999', '888', 12, '2026-07-25 10:57:20', '2026-07-25 10:57:20'),
(6, 236, '101/26', '2026-07-28', '2026-07-28', 'arhum', 'salar', 'lawer', 'male', '89446-8483468-4', '+92', '8644348446', 'ransomware', 'na', 'Zonal Directorate', 0, NULL, NULL, NULL, 'enquiry_registration', NULL, NULL, 'signatures/A7UXk9CfCQbrxhDdmd2XfllvjE9EOOZkdX1B1bJs.png', '7575', '7575', 12, '2026-07-27 23:20:31', '2026-07-27 23:20:31'),
(7, 240, '105/26', '2026-08-04', '2026-08-07', 'ali', 'ahsan', 'job', 'male', '22222-2222222-2', '+92', '3213213232', 'cyberstalking', 'images blackmail', 'NCCIA - HQ', 0, '[{\"cnic\": \"32432-4324354-4\", \"name\": \"ahmed\", \"phone\": \"5675675343\", \"photo\": \"verification-reports/accused-photos/t3DjzhHvXCkOGGTPzpGkW0QBtQUzlfNfVk24oSxO.jpg\", \"address\": \"xyz\", \"father_name\": \"xyz\"}]', NULL, NULL, 'enquiry_registration', NULL, '[{\"file\": \"verification-reports/evidence/JLsW6C4dLDFmYjXGudUNWk21aeXLDjZ6Ika4WFeX.jpg\", \"description\": \"accident\", \"original_name\": \"images.jfif\"}]', NULL, '333', '444', 23, '2026-08-04 02:43:49', '2026-08-04 02:43:49');

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

CREATE TABLE `zones` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `zones`
--

INSERT INTO `zones` (`id`, `name`, `code`, `created_at`, `updated_at`) VALUES
(1, 'North Zone', 'NZ', '2026-07-17 05:48:16', '2026-07-17 05:48:16'),
(2, 'South Zone', 'SZ', '2026-07-17 05:48:16', '2026-07-17 05:48:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject` (`subject_type`,`subject_id`),
  ADD KEY `causer` (`causer_type`,`causer_id`),
  ADD KEY `activity_log_log_name_index` (`log_name`);

--
-- Indexes for table `arrests`
--
ALTER TABLE `arrests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `arrests_case_id_foreign` (`case_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `cases`
--
ALTER TABLE `cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cases_fir_no_unique` (`fir_no`),
  ADD KEY `cases_enquiry_id_foreign` (`enquiry_id`),
  ADD KEY `cases_investigation_officer_id_foreign` (`investigation_officer_id`),
  ADD KEY `cases_merge_complaint_id_foreign` (`merge_complaint_id`);

--
-- Indexes for table `case_activities`
--
ALTER TABLE `case_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_activities_case_id_foreign` (`case_id`),
  ADD KEY `case_activities_created_by_foreign` (`created_by`);

--
-- Indexes for table `case_approvals`
--
ALTER TABLE `case_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_approvals_case_id_foreign` (`case_id`),
  ADD KEY `case_approvals_circle_incharge_id_foreign` (`circle_incharge_id`);

--
-- Indexes for table `case_legal_opinions`
--
ALTER TABLE `case_legal_opinions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_legal_opinions_case_id_foreign` (`case_id`),
  ADD KEY `case_legal_opinions_created_by_foreign` (`created_by`);

--
-- Indexes for table `circles`
--
ALTER TABLE `circles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `circles_code_unique` (`code`),
  ADD KEY `circles_zone_id_foreign` (`zone_id`);

--
-- Indexes for table `cmu_options`
--
ALTER TABLE `cmu_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `complaints_tracking_no_unique` (`tracking_no`),
  ADD KEY `complaints_user_id_foreign` (`user_id`),
  ADD KEY `complaints_operator_id_foreign` (`operator_id`),
  ADD KEY `complaints_circle_id_foreign` (`circle_id`),
  ADD KEY `complaints_merged_with_id_foreign` (`merged_with_id`),
  ADD KEY `complaints_transfer_to_circle_id_foreign` (`transfer_to_circle_id`),
  ADD KEY `complaints_enquiry_id_foreign` (`enquiry_id`);

--
-- Indexes for table `court_cases`
--
ALTER TABLE `court_cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `court_cases_case_id_foreign` (`case_id`);

--
-- Indexes for table `court_hearings`
--
ALTER TABLE `court_hearings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `court_hearings_court_case_id_foreign` (`court_case_id`);

--
-- Indexes for table `court_reports`
--
ALTER TABLE `court_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `court_reports_court_case_id_foreign` (`court_case_id`),
  ADD KEY `court_reports_submitted_by_foreign` (`submitted_by`);

--
-- Indexes for table `court_verdicts`
--
ALTER TABLE `court_verdicts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `court_verdicts_court_case_id_foreign` (`court_case_id`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enquiries_enquiry_number_unique` (`enquiry_number`),
  ADD KEY `enquiries_complaint_id_foreign` (`complaint_id`),
  ADD KEY `enquiries_enquiry_officer_id_foreign` (`enquiry_officer_id`),
  ADD KEY `enquiries_merge_complaint_id_foreign` (`merge_complaint_id`),
  ADD KEY `enquiries_case_file_id_foreign` (`case_file_id`);

--
-- Indexes for table `enquiry_activities`
--
ALTER TABLE `enquiry_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enquiry_activities_enquiry_id_foreign` (`enquiry_id`),
  ADD KEY `enquiry_activities_created_by_foreign` (`created_by`);

--
-- Indexes for table `enquiry_approvals`
--
ALTER TABLE `enquiry_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enquiry_approvals_enquiry_id_foreign` (`enquiry_id`),
  ADD KEY `enquiry_approvals_circle_incharge_id_foreign` (`circle_incharge_id`);

--
-- Indexes for table `enquiry_legal_opinions`
--
ALTER TABLE `enquiry_legal_opinions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enquiry_legal_opinions_enquiry_id_foreign` (`enquiry_id`),
  ADD KEY `enquiry_legal_opinions_created_by_foreign` (`created_by`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `investigation_officers`
--
ALTER TABLE `investigation_officers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `investigation_officers_badge_no_unique` (`badge_no`),
  ADD KEY `investigation_officers_user_id_foreign` (`user_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `laws`
--
ALTER TABLE `laws`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `offence_types`
--
ALTER TABLE `offence_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `offence_types_value_unique` (`value`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otps_email_index` (`email`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `professions`
--
ALTER TABLE `professions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `received_from_options`
--
ALTER TABLE `received_from_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `received_via_options`
--
ALTER TABLE `received_via_options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `rules`
--
ALTER TABLE `rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `sops`
--
ALTER TABLE `sops`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_circle_id_foreign` (`circle_id`),
  ADD KEY `users_zone_id_foreign` (`zone_id`);

--
-- Indexes for table `user_manuals`
--
ALTER TABLE `user_manuals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `verifications`
--
ALTER TABLE `verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `verifications_complaint_id_foreign` (`complaint_id`),
  ADD KEY `verifications_verification_officer_id_foreign` (`verification_officer_id`),
  ADD KEY `verifications_merge_complaint_id_foreign` (`merge_complaint_id`),
  ADD KEY `verifications_assigned_by_foreign` (`assigned_by`),
  ADD KEY `verifications_transfer_circle_id_foreign` (`transfer_circle_id`);

--
-- Indexes for table `verification_approvals`
--
ALTER TABLE `verification_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `verification_approvals_verification_id_foreign` (`verification_id`),
  ADD KEY `verification_approvals_circle_incharge_id_foreign` (`circle_incharge_id`),
  ADD KEY `verification_approvals_merge_complaint_id_foreign` (`merge_complaint_id`),
  ADD KEY `verification_approvals_transfer_circle_id_foreign` (`transfer_circle_id`);

--
-- Indexes for table `verification_reports`
--
ALTER TABLE `verification_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `verification_reports_complaint_id_foreign` (`complaint_id`),
  ADD KEY `verification_reports_created_by_foreign` (`created_by`);

--
-- Indexes for table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `zones_code_unique` (`code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- AUTO_INCREMENT for table `arrests`
--
ALTER TABLE `arrests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cases`
--
ALTER TABLE `cases`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `case_activities`
--
ALTER TABLE `case_activities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `case_approvals`
--
ALTER TABLE `case_approvals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `case_legal_opinions`
--
ALTER TABLE `case_legal_opinions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `circles`
--
ALTER TABLE `circles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cmu_options`
--
ALTER TABLE `cmu_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=241;

--
-- AUTO_INCREMENT for table `court_cases`
--
ALTER TABLE `court_cases`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `court_hearings`
--
ALTER TABLE `court_hearings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `court_reports`
--
ALTER TABLE `court_reports`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `court_verdicts`
--
ALTER TABLE `court_verdicts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `enquiry_activities`
--
ALTER TABLE `enquiry_activities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `enquiry_approvals`
--
ALTER TABLE `enquiry_approvals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enquiry_legal_opinions`
--
ALTER TABLE `enquiry_legal_opinions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `investigation_officers`
--
ALTER TABLE `investigation_officers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `laws`
--
ALTER TABLE `laws`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `offence_types`
--
ALTER TABLE `offence_types`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `professions`
--
ALTER TABLE `professions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `received_from_options`
--
ALTER TABLE `received_from_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `received_via_options`
--
ALTER TABLE `received_via_options`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `rules`
--
ALTER TABLE `rules`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sops`
--
ALTER TABLE `sops`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `user_manuals`
--
ALTER TABLE `user_manuals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verifications`
--
ALTER TABLE `verifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `verification_approvals`
--
ALTER TABLE `verification_approvals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verification_reports`
--
ALTER TABLE `verification_reports`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `zones`
--
ALTER TABLE `zones`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `arrests`
--
ALTER TABLE `arrests`
  ADD CONSTRAINT `arrests_case_id_foreign` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cases`
--
ALTER TABLE `cases`
  ADD CONSTRAINT `cases_enquiry_id_foreign` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cases_investigation_officer_id_foreign` FOREIGN KEY (`investigation_officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cases_merge_complaint_id_foreign` FOREIGN KEY (`merge_complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `case_activities`
--
ALTER TABLE `case_activities`
  ADD CONSTRAINT `case_activities_case_id_foreign` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `case_activities_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `case_approvals`
--
ALTER TABLE `case_approvals`
  ADD CONSTRAINT `case_approvals_case_id_foreign` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `case_approvals_circle_incharge_id_foreign` FOREIGN KEY (`circle_incharge_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `case_legal_opinions`
--
ALTER TABLE `case_legal_opinions`
  ADD CONSTRAINT `case_legal_opinions_case_id_foreign` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `case_legal_opinions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `circles`
--
ALTER TABLE `circles`
  ADD CONSTRAINT `circles_zone_id_foreign` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_circle_id_foreign` FOREIGN KEY (`circle_id`) REFERENCES `circles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `complaints_enquiry_id_foreign` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `complaints_merged_with_id_foreign` FOREIGN KEY (`merged_with_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `complaints_operator_id_foreign` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `complaints_transfer_to_circle_id_foreign` FOREIGN KEY (`transfer_to_circle_id`) REFERENCES `circles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `complaints_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `court_cases`
--
ALTER TABLE `court_cases`
  ADD CONSTRAINT `court_cases_case_id_foreign` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `court_hearings`
--
ALTER TABLE `court_hearings`
  ADD CONSTRAINT `court_hearings_court_case_id_foreign` FOREIGN KEY (`court_case_id`) REFERENCES `court_cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `court_reports`
--
ALTER TABLE `court_reports`
  ADD CONSTRAINT `court_reports_court_case_id_foreign` FOREIGN KEY (`court_case_id`) REFERENCES `court_cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `court_reports_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `court_verdicts`
--
ALTER TABLE `court_verdicts`
  ADD CONSTRAINT `court_verdicts_court_case_id_foreign` FOREIGN KEY (`court_case_id`) REFERENCES `court_cases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD CONSTRAINT `enquiries_case_file_id_foreign` FOREIGN KEY (`case_file_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `enquiries_complaint_id_foreign` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiries_enquiry_officer_id_foreign` FOREIGN KEY (`enquiry_officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `enquiries_merge_complaint_id_foreign` FOREIGN KEY (`merge_complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `enquiry_activities`
--
ALTER TABLE `enquiry_activities`
  ADD CONSTRAINT `enquiry_activities_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `enquiry_activities_enquiry_id_foreign` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enquiry_approvals`
--
ALTER TABLE `enquiry_approvals`
  ADD CONSTRAINT `enquiry_approvals_circle_incharge_id_foreign` FOREIGN KEY (`circle_incharge_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enquiry_approvals_enquiry_id_foreign` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enquiry_legal_opinions`
--
ALTER TABLE `enquiry_legal_opinions`
  ADD CONSTRAINT `enquiry_legal_opinions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `enquiry_legal_opinions_enquiry_id_foreign` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `investigation_officers`
--
ALTER TABLE `investigation_officers`
  ADD CONSTRAINT `investigation_officers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_circle_id_foreign` FOREIGN KEY (`circle_id`) REFERENCES `circles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_zone_id_foreign` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `verifications`
--
ALTER TABLE `verifications`
  ADD CONSTRAINT `verifications_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verifications_complaint_id_foreign` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `verifications_merge_complaint_id_foreign` FOREIGN KEY (`merge_complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verifications_transfer_circle_id_foreign` FOREIGN KEY (`transfer_circle_id`) REFERENCES `circles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verifications_verification_officer_id_foreign` FOREIGN KEY (`verification_officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `verification_approvals`
--
ALTER TABLE `verification_approvals`
  ADD CONSTRAINT `verification_approvals_circle_incharge_id_foreign` FOREIGN KEY (`circle_incharge_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `verification_approvals_merge_complaint_id_foreign` FOREIGN KEY (`merge_complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verification_approvals_transfer_circle_id_foreign` FOREIGN KEY (`transfer_circle_id`) REFERENCES `circles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verification_approvals_verification_id_foreign` FOREIGN KEY (`verification_id`) REFERENCES `verifications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `verification_reports`
--
ALTER TABLE `verification_reports`
  ADD CONSTRAINT `verification_reports_complaint_id_foreign` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `verification_reports_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
