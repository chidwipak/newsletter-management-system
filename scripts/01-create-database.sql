-- Newsletter/Magazine Management System Database Setup
-- This script creates the main database and all required tables with proper relationships

-- Drop database if exists and create fresh (for development)
DROP DATABASE IF EXISTS newsletter_system;
CREATE DATABASE newsletter_system;
USE newsletter_system;

-- Users table - stores all system users with role-based access
-- This is the main authentication table with encrypted passwords
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store bcrypt hashed passwords
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'editor', 'subscriber') DEFAULT 'subscriber',
    subscription_status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    subscription_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email),
    INDEX idx_users_subscription (subscription_status)
);

-- Issues table - represents magazine/newsletter issues
-- Each issue can contain multiple articles
CREATE TABLE issues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    issue_number INT NOT NULL UNIQUE, -- Ensure unique issue numbers
    publication_date DATE NOT NULL,
    cover_image_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600', -- Default cover image
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_issues_status (status),
    INDEX idx_issues_publication_date (publication_date)
);

-- Articles table - individual articles within issues
-- Each article belongs to an issue and has an author
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id INT,
    issue_id INT,
    featured_image_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600', -- Default article image
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    INDEX idx_articles_status (status),
    INDEX idx_articles_issue (issue_id),
    INDEX idx_articles_author (author_id)
);

-- Feedback table - user feedback and ratings for articles
-- Ensures one feedback per user per article with unique constraint
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_article_feedback (user_id, article_id), -- One feedback per user per article
    INDEX idx_feedback_article (article_id),
    INDEX idx_feedback_rating (rating)
);

-- Subscriptions table - tracks subscription history and renewals
-- Links to users table for subscription management
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subscription_type ENUM('monthly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_status (status)
);

-- Verify tables were created successfully
SHOW TABLES;
