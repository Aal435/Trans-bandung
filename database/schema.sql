-- TransBandung City Transportation System Database Schema

-- Users Table (for local authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Routes Table (transportation routes)
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_number VARCHAR(20) UNIQUE NOT NULL,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    stops JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Schedules Table (bus/transport schedules)
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    frequency VARCHAR(50),
    vehicle_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Reports Table (congestion and accident reports)
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('accident', 'congestion') NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    photo_url VARCHAR(500),
    document_url VARCHAR(500),
    status ENUM('pending', 'verified', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transportation Monitoring Table (real-time vehicle status)
CREATE TABLE IF NOT EXISTS transportation_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    current_location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    passenger_count INT DEFAULT 0,
    status ENUM('active', 'inactive', 'delayed') DEFAULT 'active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_route_number ON routes(route_number);
CREATE INDEX idx_report_user ON reports(user_id);
CREATE INDEX idx_report_type ON reports(type);
CREATE INDEX idx_schedule_route ON schedules(route_id);
CREATE INDEX idx_monitoring_vehicle ON transportation_monitoring(vehicle_id);
