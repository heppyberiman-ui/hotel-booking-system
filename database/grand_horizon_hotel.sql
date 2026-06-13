-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2026 at 08:30 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `grand_horizon_hotel`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending Verification',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `booking_code` varchar(100) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `room_id`, `check_in`, `check_out`, `total_price`, `status`, `created_at`, `payment_method`, `payment_proof`, `payment_status`, `booking_code`, `verified_at`, `verified_by`) VALUES
(1, 3, 4, '2026-06-15', '2026-06-17', NULL, 'confirmed', '2026-06-11 04:19:11', NULL, NULL, 'pending', NULL, NULL, NULL),
(2, 4, 4, '2026-06-11', '2026-06-12', 500000.00, 'confirmed', '2026-06-11 07:19:49', NULL, NULL, 'pending', NULL, NULL, NULL),
(3, 5, 5, '2026-06-11', '2026-06-12', 500000.00, 'confirmed', '2026-06-11 11:06:38', NULL, NULL, 'pending', NULL, NULL, NULL),
(4, 4, 4, '2026-06-12', '2026-06-13', 500000.00, 'confirmed', '2026-06-12 05:07:13', 'Transfer BCA', NULL, 'paid', NULL, NULL, NULL),
(5, 3, 4, '2026-06-12', '2026-06-14', 1000000.00, 'confirmed', '2026-06-12 05:21:42', 'BRI', '/uploads/1781241702355-675896072.png', 'paid', 'GH-2026-0001', NULL, NULL),
(7, 7, 10, '2026-06-13', '2026-06-14', 750000.00, 'checked_out', '2026-06-13 05:17:08', 'BRI', '/uploads/1781327828509-532856580.png', 'paid', 'GH-2026-0002', '2026-06-13 12:42:44', 'Admin Baru');

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `id` int(11) NOT NULL,
  `facility_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `facility_name`, `description`, `image`, `created_at`) VALUES
(2, 'Infinity Pool', 'Kolam renang infinity dengan pemandangan laut. Terletak di rooftop lantai 15. Buka pukul 06:00 - 22:00 WIB.', 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd', '2026-06-13 03:53:38'),
(3, 'Fitness Center', 'terletak di lantai 13', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', '2026-06-13 03:55:19'),
(4, 'Restaurant & Cafe', 'terletak di lantai 10 ', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', '2026-06-13 03:56:03');

-- --------------------------------------------------------

--
-- Table structure for table `galleries`
--

CREATE TABLE `galleries` (
  `id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `proof` varchar(255) DEFAULT NULL,
  `status` enum('pending','paid','rejected') DEFAULT 'pending',
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(20) NOT NULL,
  `room_type_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('available','booked','maintenance') DEFAULT 'available',
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL,
  `capacity` int(11) DEFAULT 2,
  `bed_type` varchar(100) DEFAULT NULL,
  `room_size` int(11) DEFAULT 0,
  `wifi` tinyint(1) DEFAULT 0,
  `breakfast` tinyint(1) DEFAULT 0,
  `ac` tinyint(1) DEFAULT 0,
  `tv` tinyint(1) DEFAULT 0,
  `minibar` tinyint(1) DEFAULT 0,
  `balcony` tinyint(1) DEFAULT 0,
  `stock_kamar` int(11) DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_number`, `room_type_id`, `price`, `status`, `image`, `created_at`, `description`, `capacity`, `bed_type`, `room_size`, `wifi`, `breakfast`, `ac`, `tv`, `minibar`, `balcony`, `stock_kamar`) VALUES
(4, '101', 1, 500000.00, 'available', NULL, '2026-06-09 06:03:35', 'Kamar Super Deluxe dengan Queen Bed nyaman, WiFi, AC, Smart TV, dan sarapan lezat.', 2, 'Queen Bed', 30, 1, 1, 1, 1, 0, 0, 2),
(5, '102', 1, 500000.00, 'available', NULL, '2026-06-09 06:03:35', 'Kamar Super Deluxe dengan Queen Bed nyaman, WiFi, AC, Smart TV, dan sarapan lezat.', 2, 'Queen Bed', 30, 1, 1, 1, 1, 0, 0, 5),
(6, '201', 2, 750000.00, 'available', NULL, '2026-06-09 06:03:35', 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.', 3, 'King Bed', 40, 1, 1, 1, 1, 0, 1, 5),
(9, '301', 3, 1200000.00, 'available', NULL, '2026-06-11 13:32:18', 'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.', 4, 'King Bed Premium', 60, 1, 1, 1, 1, 1, 1, 5),
(10, '202', 2, 750000.00, 'available', NULL, '2026-06-12 04:15:10', 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.', 3, 'King Bed', 40, 1, 1, 1, 1, 0, 1, 4),
(11, '302', 3, 1200000.00, 'available', NULL, '2026-06-12 04:15:10', 'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room (ruang tamu terpisah), Mini Bar, balkon pribadi, WiFi, AC, Smart TV, dan sarapan pagi.', 4, 'King Bed Premium', 60, 1, 1, 1, 1, 1, 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `room_types`
--

CREATE TABLE `room_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(500) DEFAULT NULL,
  `base_price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_types`
--

INSERT INTO `room_types` (`id`, `type_name`, `description`, `capacity`, `created_at`, `image_url`, `base_price`) VALUES
(1, 'Super Deluxe', 'Kamar Super Deluxe dengan Queen Bed nyaman, WiFi, AC, Smart TV, dan sarapan lezat.', 2, '2026-06-09 06:00:48', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1600&auto=format&fit=crop', 500000.00),
(2, 'Deluxe Room', 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi.', 2, '2026-06-09 06:00:48', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop', 750000.00),
(3, 'Suite Room', 'Suite Room mewah berukuran 60 m² dengan King Bed Premium, Living Room, dan Mini Bar.', 4, '2026-06-09 06:00:48', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop', 1200000.00),
(4, 'Deluxe', 'Kamar Deluxe Room berukuran 40 m² yang luas dengan King Bed, dilengkapi balkon pribadi.', NULL, '2026-06-10 04:15:01', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop', 750000.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','receptionist','customer') DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `avatar_url`) VALUES
(1, 'Administrator', 'admin@gmail.com', '$2b$10$N9g023CEwty8RwEXVGb/PeWsKaZDDRb7wC4rzW4XzPF3KR6aUqSRW', 'admin', '2026-06-09 02:31:09', NULL),
(3, 'Admin Baru', 'adminbaru@gmail.com', '$2b$10$PhiLt2/xUx7pgUV.np/gQuG/WnW.OXlyw.fH6CU8pCKVzkwRgKwie', 'admin', '2026-06-10 05:18:58', NULL),
(4, 'heppy', 'heppy@gmail.com', '$2b$10$N9g023CEwty8RwEXVGb/Pe4ZpJ01ajt2e5MwdkMQF106Tl/fOpZYa', 'customer', '2026-06-11 07:18:57', NULL),
(5, 'ani', 'ani@gmail.com', '$2b$10$kqPNYJU8B4vRYvZdb8HHpuBBZ.BLpVJLRDYorsuahG5Xtas8HwIY.', 'customer', '2026-06-11 11:03:20', NULL),
(6, 'Test Customer', 'testcustomer@gmail.com', '$2b$10$aVEnecLkLZfknZ2xp/vCB.O5YsH3kVAhoAxe5ygIi52ISj6cuW9o.', 'customer', '2026-06-12 05:29:53', NULL),
(7, 'HEPPY BERIMAN HAREFA', '24570009@stmik.jayakarta.ac.id', NULL, 'customer', '2026-06-13 03:33:14', 'https://lh3.googleusercontent.com/a/ACg8ocJRMf1c2WhuULTB8W72CWUfYYrlFv3F55nN3iRFhenwawhxuA=s96-c');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `galleries`
--
ALTER TABLE `galleries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `galleries`
--
ALTER TABLE `galleries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `room_types`
--
ALTER TABLE `room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`);

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
