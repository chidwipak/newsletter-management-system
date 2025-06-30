// Database initialization script
// Fixed to handle MySQL prepared statement protocol limitations
// Uses query() for DDL commands and execute() for DML commands

const mysql = require("mysql2/promise")

async function initializeDatabase() {
  let connection

  try {
    console.log("🔄 Initializing database...")

    // Create connection without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Chintu@2006",
      multipleStatements: false,
    })

    console.log("✅ Connected to MySQL server")

    // Step 1: Drop and create database using query() method (not execute())
    console.log("🔄 Creating database...")
    await connection.query("DROP DATABASE IF EXISTS newsletter_system")
    await connection.query("CREATE DATABASE newsletter_system")
    await connection.query("USE newsletter_system")
    console.log("✅ Database created successfully")

    // Step 2: Create tables one by one using query() method
    console.log("🔄 Creating tables...")

    // Users table
    await connection.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'editor', 'subscriber') DEFAULT 'subscriber',
        subscription_status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        subscription_end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_role (role),
        INDEX idx_users_email (email),
        INDEX idx_users_subscription (subscription_status)
      )
    `)

    // Issues table
    await connection.query(`
      CREATE TABLE issues (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        issue_number INT NOT NULL UNIQUE,
        publication_date DATE NOT NULL,
        cover_image_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600',
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_issues_status (status),
        INDEX idx_issues_publication_date (publication_date)
      )
    `)

    // Articles table
    await connection.query(`
      CREATE TABLE articles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        author_id INT,
        issue_id INT,
        featured_image_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600',
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_articles_status (status),
        INDEX idx_articles_issue (issue_id),
        INDEX idx_articles_author (author_id)
      )
    `)

    // Feedback table
    await connection.query(`
      CREATE TABLE feedback (
        id INT PRIMARY KEY AUTO_INCREMENT,
        article_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_article_feedback (user_id, article_id),
        INDEX idx_feedback_article (article_id),
        INDEX idx_feedback_rating (rating)
      )
    `)

    // Subscriptions table
    await connection.query(`
      CREATE TABLE subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        subscription_type ENUM('monthly', 'yearly') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_subscriptions_user (user_id),
        INDEX idx_subscriptions_status (status)
      )
    `)

    // Add foreign key constraints after all tables are created using query() method
    await connection.query(`
      ALTER TABLE issues 
      ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    `)

    await connection.query(`
      ALTER TABLE articles 
      ADD FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    `)

    await connection.query(`
      ALTER TABLE articles 
      ADD FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    `)

    await connection.query(`
      ALTER TABLE feedback 
      ADD FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    `)

    await connection.query(`
      ALTER TABLE feedback 
      ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `)

    await connection.query(`
      ALTER TABLE subscriptions 
      ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `)

    console.log("✅ All tables created successfully")

    // Step 3: Insert sample data using execute() method for parameterized queries
    console.log("🔄 Inserting sample data...")
    await insertSampleData(connection)
    console.log("✅ Sample data inserted successfully")

    // Verify setup by checking table counts using query() method
    const [results] = await connection.query(`
      SELECT 
        'users' as table_name, COUNT(*) as count FROM users
      UNION ALL
      SELECT 'issues' as table_name, COUNT(*) as count FROM issues
      UNION ALL
      SELECT 'articles' as table_name, COUNT(*) as count FROM articles
      UNION ALL
      SELECT 'feedback' as table_name, COUNT(*) as count FROM feedback
      UNION ALL
      SELECT 'subscriptions' as table_name, COUNT(*) as count FROM subscriptions
    `)

    console.log("\n📊 Database initialization complete:")
    results.forEach((row) => {
      console.log(`   ${row.table_name}: ${row.count} records`)
    })

    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message)
    console.error("Full error:", error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Insert sample data function using execute() for parameterized queries
async function insertSampleData(connection) {
  try {
    // Insert sample users with hashed passwords
    // Password is 'password' for all demo accounts (hashed with bcrypt)
    const hashedPassword = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

    await connection.execute(
      `
      INSERT INTO users (username, email, password, full_name, role, subscription_status, subscription_end_date) VALUES
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        "admin_user",
        "admin@newsletter.com",
        hashedPassword,
        "System Administrator",
        "admin",
        "active",
        "2025-12-31",
        "editor_john",
        "john.editor@newsletter.com",
        hashedPassword,
        "John Smith",
        "editor",
        "active",
        "2025-12-31",
        "editor_sarah",
        "sarah.editor@newsletter.com",
        hashedPassword,
        "Sarah Johnson",
        "editor",
        "active",
        "2025-12-31",
        "subscriber_mike",
        "mike@email.com",
        hashedPassword,
        "Mike Wilson",
        "subscriber",
        "active",
        "2025-06-30",
        "subscriber_anna",
        "anna@email.com",
        hashedPassword,
        "Anna Davis",
        "subscriber",
        "active",
        "2025-08-15",
        "subscriber_tom",
        "tom@email.com",
        hashedPassword,
        "Tom Brown",
        "subscriber",
        "expired",
        "2024-12-31",
        "editor_lisa",
        "lisa.editor@newsletter.com",
        hashedPassword,
        "Lisa Chen",
        "editor",
        "active",
        "2025-12-31",
        "subscriber_david",
        "david@email.com",
        hashedPassword,
        "David Rodriguez",
        "subscriber",
        "active",
        "2025-09-20",
      ],
    )

    // Insert sample issues
    await connection.execute(
      `
      INSERT INTO issues (title, description, issue_number, publication_date, cover_image_url, status, created_by) VALUES
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        "Tech Trends 2025",
        "Exploring the latest technology trends and innovations shaping our digital future",
        1,
        "2025-01-15",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600",
        "published",
        2,
        "Digital Marketing Mastery",
        "Complete guide to modern digital marketing strategies, tools, and best practices",
        2,
        "2025-02-15",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600",
        "published",
        3,
        "Future of Work",
        "How remote work, AI, and automation are reshaping the modern workplace",
        3,
        "2025-03-15",
        "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600",
        "published",
        7,
        "Cybersecurity Essentials",
        "Protecting your digital assets in an increasingly connected world",
        4,
        "2025-04-15",
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600",
        "draft",
        2,
        "Sustainable Technology",
        "Green tech solutions for environmental challenges",
        5,
        "2025-05-15",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600",
        "draft",
        3,
      ],
    )

    // Insert sample articles one by one for better error handling
    const articles = [
      {
        title: "Artificial Intelligence Revolution",
        content:
          "Artificial Intelligence is transforming every aspect of our lives, from healthcare to transportation. This comprehensive exploration delves into the current state of AI technology, examining machine learning algorithms, neural networks, and deep learning frameworks that power modern AI systems.\n\nWe explore real-world applications across industries: AI-powered diagnostic tools in healthcare that can detect diseases earlier than human doctors, autonomous vehicles that promise to revolutionize transportation, and intelligent automation systems that are reshaping manufacturing processes.\n\nThe article also addresses critical ethical considerations surrounding AI development, including bias in algorithms, privacy concerns, and the need for responsible AI governance. We discuss the impact on job markets, examining which roles are most at risk and what new opportunities are emerging.\n\nLooking ahead, we analyze emerging trends like quantum computing integration with AI, the development of artificial general intelligence (AGI), and the potential societal implications of these advances.",
        summary:
          "A comprehensive analysis of how artificial intelligence is revolutionizing industries and reshaping our future.",
        author_id: 2,
        issue_id: 1,
        featured_image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600",
        status: "published",
        view_count: 245,
      },
      {
        title: "Social Media Marketing Strategies",
        content:
          "Social media has evolved from a simple communication platform to the cornerstone of modern digital marketing. This in-depth guide provides actionable strategies for businesses to leverage social media platforms effectively and build meaningful connections with their audience.\n\nWe begin with platform-specific strategies, examining the unique characteristics and best practices for Facebook, Instagram, Twitter, LinkedIn, TikTok, and emerging platforms. Each section includes detailed guidance on content creation, optimal posting times, and audience engagement techniques.\n\nThe article covers advanced topics including influencer partnerships, social media advertising optimization, and measuring return on investment (ROI). We provide frameworks for developing comprehensive social media strategies aligned with business objectives.",
        summary: "Essential strategies and best practices for successful social media marketing campaigns.",
        author_id: 3,
        issue_id: 2,
        featured_image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600",
        status: "published",
        view_count: 189,
      },
      {
        title: "Remote Work Best Practices",
        content:
          "The global shift to remote work has fundamentally changed how we approach professional collaboration and productivity. This comprehensive guide outlines proven strategies for thriving in remote work environments, addressing challenges faced by both employees and managers.\n\nWe start with the fundamentals of setting up an effective home office, covering ergonomic considerations, technology requirements, and creating boundaries between work and personal spaces. The article provides detailed recommendations for essential tools and equipment that enhance remote productivity.\n\nCommunication strategies form a crucial component, with extensive coverage of video conferencing best practices, asynchronous communication techniques, and maintaining team cohesion across distributed teams.",
        summary: "Complete guide to excelling in remote work environments.",
        author_id: 2,
        issue_id: 3,
        featured_image_url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600",
        status: "published",
        view_count: 167,
      },
      {
        title: "Cybersecurity Essentials",
        content:
          "In our increasingly digital world, cybersecurity has become more critical than ever before. This comprehensive guide covers essential cybersecurity practices for individuals and businesses, providing practical strategies to protect against evolving digital threats.\n\nWe begin with an overview of the current threat landscape, examining common attack vectors including phishing, malware, ransomware, and social engineering. Each threat type is explained with real-world examples and indicators to help readers recognize potential attacks.\n\nThe article provides detailed guidance on fundamental security practices: creating strong, unique passwords and implementing multi-factor authentication, securing home and office networks, and maintaining updated software and systems.",
        summary: "Essential cybersecurity practices and strategies to protect against digital threats.",
        author_id: 3,
        issue_id: 1,
        featured_image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600",
        status: "published",
        view_count: 156,
      },
      {
        title: "Cloud Computing Fundamentals",
        content:
          "Cloud computing has revolutionized how businesses approach IT infrastructure and software deployment. This comprehensive introduction covers fundamental concepts, service models, and practical implementation strategies for organizations considering cloud adoption.\n\nWe explore the three primary cloud service models: Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS). Each model is explained with practical examples and use cases, helping readers understand which approach best fits their needs.\n\nThe article examines major cloud providers including Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform, comparing their strengths, pricing models, and key services.",
        summary: "Comprehensive introduction to cloud computing concepts and implementation strategies.",
        author_id: 7,
        issue_id: 3,
        featured_image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600",
        status: "published",
        view_count: 134,
      },
      {
        title: "Data Analytics for Business",
        content:
          "Data analytics has become a critical competitive advantage for modern businesses. This practical guide explores how organizations can harness the power of data to drive informed decision-making and improve business outcomes.\n\nWe begin with foundational concepts, explaining different types of analytics: descriptive, diagnostic, predictive, and prescriptive. Each type is illustrated with business scenarios and practical applications across various industries.\n\nThe article covers essential tools and technologies for data analytics, from spreadsheet-based analysis to advanced business intelligence platforms and machine learning frameworks.",
        summary: "Practical guide to implementing data analytics in business.",
        author_id: 2,
        issue_id: 2,
        featured_image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600",
        status: "published",
        view_count: 198,
      },
    ]

    for (const article of articles) {
      await connection.execute(
        `
        INSERT INTO articles (title, content, summary, author_id, issue_id, featured_image_url, status, view_count) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          article.title,
          article.content,
          article.summary,
          article.author_id,
          article.issue_id,
          article.featured_image_url,
          article.status,
          article.view_count,
        ],
      )
    }

    // Insert sample feedback
    const feedbackData = [
      [
        1,
        4,
        5,
        "Excellent article! Very comprehensive and well-researched. The AI examples were particularly helpful.",
      ],
      [1, 5, 4, "Great overview of AI trends. Would love to see more technical details in future articles."],
      [
        1,
        6,
        5,
        "This article helped me understand AI applications in my industry. The ethical considerations section was especially valuable.",
      ],
      [1, 8, 4, "Well-written and informative. The section on job market impacts was eye-opening."],
      [2, 4, 4, "Solid social media strategies. The Instagram tips were especially useful for my small business."],
      [2, 5, 3, "Good content but could use more recent case studies and examples from 2024-2025."],
      [2, 6, 5, "Fantastic guide! Implemented several strategies and already seeing improved engagement."],
      [3, 4, 5, "Perfect timing for this article. Remote work tips are practical and immediately applicable."],
      [
        3,
        8,
        4,
        "Great insights on managing remote teams. The communication strategies section was particularly valuable.",
      ],
      [
        4,
        4,
        5,
        "Cybersecurity is so important these days. This article covers all the basics perfectly and includes actionable steps.",
      ],
      [
        4,
        6,
        4,
        "Very practical advice. I have already implemented several of these security measures for my business.",
      ],
      [
        4,
        8,
        5,
        "Comprehensive coverage of cybersecurity essentials. The business security section was especially helpful.",
      ],
      [5, 5, 4, "Good introduction to cloud computing. Helped me understand the different service models clearly."],
      [5, 6, 3, "Informative but could use more specific pricing comparisons between providers."],
      [6, 4, 5, "Excellent guide to data analytics. The visualization section provided great practical tips."],
      [6, 8, 4, "Well-structured article. The business case studies were particularly enlightening."],
    ]

    for (const feedback of feedbackData) {
      await connection.execute(
        `
        INSERT INTO feedback (article_id, user_id, rating, comment) VALUES (?, ?, ?, ?)
      `,
        feedback,
      )
    }

    // Insert sample subscriptions
    await connection.execute(
      `
      INSERT INTO subscriptions (user_id, subscription_type, start_date, end_date, amount, status) VALUES
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?)
    `,
      [
        4,
        "yearly",
        "2024-07-01",
        "2025-06-30",
        99.99,
        "active",
        5,
        "yearly",
        "2024-08-15",
        "2025-08-15",
        99.99,
        "active",
        6,
        "monthly",
        "2024-01-01",
        "2024-12-31",
        9.99,
        "expired",
        8,
        "yearly",
        "2024-09-20",
        "2025-09-20",
        99.99,
        "active",
      ],
    )

    console.log("✅ All sample data inserted successfully")
  } catch (error) {
    console.error("❌ Error inserting sample data:", error)
    throw error
  }
}

module.exports = { initializeDatabase }
