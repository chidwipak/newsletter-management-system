-- Sample data for testing and demo purposes
-- This script populates the database with realistic sample data for all user roles

USE newsletter_system;

-- Clear existing data (for development/testing)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE feedback;
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE articles;
TRUNCATE TABLE issues;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample users with different roles
-- Note: Password is 'password' hashed with bcrypt (rounds=10)
-- In production, these would be properly hashed during registration
INSERT INTO users (username, email, password, full_name, role, subscription_status, subscription_end_date) VALUES
('admin_user', 'admin@newsletter.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'System Administrator', 'admin', 'active', '2025-12-31'),
('editor_john', 'john.editor@newsletter.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'John Smith', 'editor', 'active', '2025-12-31'),
('editor_sarah', 'sarah.editor@newsletter.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'Sarah Johnson', 'editor', 'active', '2025-12-31'),
('subscriber_mike', 'mike@email.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'Mike Wilson', 'subscriber', 'active', '2025-06-30'),
('subscriber_anna', 'anna@email.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'Anna Davis', 'subscriber', 'active', '2025-08-15'),
('subscriber_tom', 'tom@email.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'Tom Brown', 'subscriber', 'expired', '2024-12-31'),
('editor_lisa', 'lisa.editor@newsletter.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'Lisa Chen', 'editor', 'active', '2025-12-31'),
('subscriber_david', 'david@email.com', '$2b$10$rQZ9QmjlhQZ9QmjlhQZ9QuKZ9QmjlhQZ9QmjlhQZ9QmjlhQZ9QmjlhQ', 'David Rodriguez', 'subscriber', 'active', '2025-09-20');

-- Insert sample magazine issues with realistic content
INSERT INTO issues (title, description, issue_number, publication_date, cover_image_url, status, created_by) VALUES
('Tech Trends 2025', 'Exploring the latest technology trends and innovations shaping our digital future', 1, '2025-01-15', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600', 'published', 2),
('Digital Marketing Mastery', 'Complete guide to modern digital marketing strategies, tools, and best practices', 2, '2025-02-15', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600', 'published', 3),
('Future of Work', 'How remote work, AI, and automation are reshaping the modern workplace', 3, '2025-03-15', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600', 'published', 7),
('Cybersecurity Essentials', 'Protecting your digital assets in an increasingly connected world', 4, '2025-04-15', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600', 'draft', 2),
('Sustainable Technology', 'Green tech solutions for environmental challenges', 5, '2025-05-15', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600', 'draft', 3);

-- Insert sample articles with comprehensive content
INSERT INTO articles (title, content, summary, author_id, issue_id, featured_image_url, status, view_count) VALUES
('Artificial Intelligence Revolution', 
'Artificial Intelligence is transforming every aspect of our lives, from healthcare to transportation. This comprehensive exploration delves into the current state of AI technology, examining machine learning algorithms, neural networks, and deep learning frameworks that power modern AI systems.

We explore real-world applications across industries: AI-powered diagnostic tools in healthcare that can detect diseases earlier than human doctors, autonomous vehicles that promise to revolutionize transportation, and intelligent automation systems that are reshaping manufacturing processes.

The article also addresses critical ethical considerations surrounding AI development, including bias in algorithms, privacy concerns, and the need for responsible AI governance. We discuss the impact on job markets, examining which roles are most at risk and what new opportunities are emerging.

Looking ahead, we analyze emerging trends like quantum computing integration with AI, the development of artificial general intelligence (AGI), and the potential societal implications of these advances. The piece concludes with actionable insights for businesses and individuals preparing for an AI-driven future.',
'A comprehensive analysis of how artificial intelligence is revolutionizing industries and reshaping our future, covering current applications, ethical considerations, and emerging trends.',
2, 1, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600', 'published', 245),

('Social Media Marketing Strategies', 
'Social media has evolved from a simple communication platform to the cornerstone of modern digital marketing. This in-depth guide provides actionable strategies for businesses to leverage social media platforms effectively and build meaningful connections with their audience.

We begin with platform-specific strategies, examining the unique characteristics and best practices for Facebook, Instagram, Twitter, LinkedIn, TikTok, and emerging platforms. Each section includes detailed guidance on content creation, optimal posting times, and audience engagement techniques.

The article covers advanced topics including influencer partnerships, social media advertising optimization, and measuring return on investment (ROI). We provide frameworks for developing comprehensive social media strategies aligned with business objectives.

Content creation takes center stage with discussions on video marketing, storytelling techniques, user-generated content campaigns, and the growing importance of live streaming and interactive content. We also explore the latest trends in social commerce and how businesses can integrate shopping experiences directly into social platforms.

The guide concludes with practical tools and resources for social media management, including recommended scheduling platforms, analytics tools, and methods for staying current with rapidly evolving social media trends.',
'Essential strategies and best practices for successful social media marketing campaigns, covering platform-specific tactics, content creation, and ROI measurement.',
3, 2, 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600', 'published', 189),

('Remote Work Best Practices', 
'The global shift to remote work has fundamentally changed how we approach professional collaboration and productivity. This comprehensive guide outlines proven strategies for thriving in remote work environments, addressing challenges faced by both employees and managers.

We start with the fundamentals of setting up an effective home office, covering ergonomic considerations, technology requirements, and creating boundaries between work and personal spaces. The article provides detailed recommendations for essential tools and equipment that enhance remote productivity.

Communication strategies form a crucial component, with extensive coverage of video conferencing best practices, asynchronous communication techniques, and maintaining team cohesion across distributed teams. We explore various collaboration tools and methodologies for different types of work.

The guide addresses common remote work challenges including isolation, time management difficulties, and maintaining work-life balance. Practical solutions include structured daily routines, virtual social interactions, and techniques for managing distractions in home environments.

For managers, we provide frameworks for leading remote teams effectively, including performance management strategies, virtual team building activities, and methods for maintaining company culture in distributed organizations. The article concludes with insights into the future of hybrid work models and their implications for organizational structure.',
'Complete guide to excelling in remote work environments, covering workspace setup, communication strategies, and team management best practices.',
2, 3, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600', 'published', 167),

('Cybersecurity Essentials', 
'In our increasingly digital world, cybersecurity has become more critical than ever before. This comprehensive guide covers essential cybersecurity practices for individuals and businesses, providing practical strategies to protect against evolving digital threats.

We begin with an overview of the current threat landscape, examining common attack vectors including phishing, malware, ransomware, and social engineering. Each threat type is explained with real-world examples and indicators to help readers recognize potential attacks.

The article provides detailed guidance on fundamental security practices: creating strong, unique passwords and implementing multi-factor authentication, securing home and office networks, and maintaining updated software and systems. We include step-by-step instructions for configuring security settings across various platforms and devices.

For businesses, we cover advanced topics including employee security training, incident response planning, and compliance with data protection regulations. The guide explores enterprise security solutions, from endpoint protection to network monitoring and threat intelligence.

Emerging security challenges receive special attention, including IoT device security, cloud security considerations, and the security implications of remote work. We discuss the growing importance of zero-trust security models and their implementation strategies.

The article concludes with actionable checklists for personal and business cybersecurity, recommended tools and services, and resources for staying informed about evolving security threats and best practices.',
'Essential cybersecurity practices and strategies to protect individuals and businesses from digital threats in an increasingly connected world.',
3, 1, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600', 'published', 156),

('Cloud Computing Fundamentals', 
'Cloud computing has revolutionized how businesses approach IT infrastructure and software deployment. This comprehensive introduction covers fundamental concepts, service models, and practical implementation strategies for organizations considering cloud adoption.

We explore the three primary cloud service models: Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS). Each model is explained with practical examples and use cases, helping readers understand which approach best fits their needs.

The article examines major cloud providers including Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform, comparing their strengths, pricing models, and key services. We provide guidance for evaluating providers based on specific business requirements.

Security considerations receive extensive coverage, addressing common concerns about data protection, compliance, and shared responsibility models. We discuss best practices for cloud security architecture and ongoing security management.

Cost optimization strategies are explored in detail, including rightsizing resources, implementing automated scaling, and leveraging reserved instances and spot pricing. The guide provides frameworks for calculating total cost of ownership and return on investment for cloud migrations.

The article concludes with practical migration strategies, common pitfalls to avoid, and emerging trends in cloud computing including serverless architectures, edge computing, and multi-cloud strategies.',
'Comprehensive introduction to cloud computing concepts, service models, and implementation strategies for businesses considering cloud adoption.',
7, 3, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600', 'published', 134),

('Data Analytics for Business', 
'Data analytics has become a critical competitive advantage for modern businesses. This practical guide explores how organizations can harness the power of data to drive informed decision-making and improve business outcomes.

We begin with foundational concepts, explaining different types of analytics: descriptive, diagnostic, predictive, and prescriptive. Each type is illustrated with business scenarios and practical applications across various industries.

The article covers essential tools and technologies for data analytics, from spreadsheet-based analysis to advanced business intelligence platforms and machine learning frameworks. We provide guidance for selecting appropriate tools based on organizational needs and technical capabilities.

Data collection and preparation receive detailed attention, as these steps often consume the majority of analytics projects. We discuss data quality issues, cleaning techniques, and strategies for integrating data from multiple sources.

Visualization and reporting strategies are explored extensively, with best practices for creating compelling dashboards and presentations that effectively communicate insights to stakeholders. We include examples of effective data storytelling techniques.

The guide addresses organizational considerations including building analytics teams, fostering data-driven culture, and ensuring data governance and privacy compliance. We conclude with emerging trends in analytics including real-time analytics, automated insights, and the growing role of artificial intelligence in data analysis.',
'Practical guide to implementing data analytics in business, covering tools, techniques, and organizational strategies for data-driven decision making.',
2, 2, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600', 'published', 198),

('Mobile App Development Trends', 
'The mobile app development landscape continues to evolve rapidly, driven by new technologies, changing user expectations, and emerging business models. This comprehensive overview examines current trends and future directions in mobile development.

We explore the ongoing debate between native and cross-platform development, analyzing frameworks like React Native, Flutter, and Xamarin. The article provides decision-making criteria for choosing development approaches based on project requirements, team capabilities, and long-term maintenance considerations.

User experience design receives extensive coverage, with discussions on mobile-first design principles, accessibility considerations, and emerging interaction paradigms including voice interfaces and gesture controls. We examine successful app designs and extract actionable insights.

The article addresses technical trends including progressive web apps (PWAs), serverless architectures for mobile backends, and the integration of artificial intelligence and machine learning capabilities into mobile applications.

Security considerations are thoroughly explored, covering mobile-specific threats, secure coding practices, and compliance with privacy regulations. We provide practical guidance for implementing security measures throughout the development lifecycle.

Monetization strategies receive detailed attention, examining various revenue models including freemium, subscription, advertising, and in-app purchases. We analyze successful monetization approaches across different app categories and markets.

The guide concludes with insights into emerging technologies including augmented reality, 5G implications for mobile development, and the growing importance of app store optimization and user acquisition strategies.',
'Comprehensive analysis of current trends and future directions in mobile app development, covering technical approaches, design principles, and business strategies.',
7, 1, 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600', 'published', 142),

('E-commerce Growth Strategies', 
'E-commerce continues to grow rapidly, creating opportunities and challenges for businesses of all sizes. This strategic guide explores proven methods for building and scaling successful online retail operations.

We begin with foundational elements of e-commerce success, including platform selection, payment processing, and inventory management. The article provides comparative analysis of major e-commerce platforms and guidance for making informed technology decisions.

Customer acquisition strategies receive extensive coverage, examining search engine optimization, pay-per-click advertising, social media marketing, and email marketing specifically for e-commerce contexts. We provide frameworks for calculating customer acquisition costs and lifetime value.

Conversion optimization takes center stage with detailed discussions on website design, user experience optimization, and checkout process improvement. We include case studies of successful conversion rate optimization campaigns and their measurable impacts.

The article explores advanced topics including personalization strategies, recommendation engines, and the use of artificial intelligence for inventory forecasting and dynamic pricing. We discuss implementation approaches for businesses of different sizes and technical capabilities.

International expansion considerations are thoroughly examined, covering localization, cross-border payments, shipping logistics, and regulatory compliance. We provide practical frameworks for evaluating international market opportunities.

The guide concludes with emerging trends in e-commerce including social commerce, voice commerce, and the growing importance of sustainability and ethical business practices in consumer purchasing decisions.',
'Strategic guide to building and scaling successful e-commerce operations, covering technology, marketing, optimization, and growth strategies.',
3, 2, 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600', 'draft', 89);

-- Insert sample feedback and ratings to demonstrate the rating system
INSERT INTO feedback (article_id, user_id, rating, comment) VALUES
(1, 4, 5, 'Excellent article! Very comprehensive and well-researched. The AI examples were particularly helpful for understanding practical applications.'),
(1, 5, 4, 'Great overview of AI trends. Would love to see more technical details about implementation in future articles.'),
(1, 6, 5, 'This article helped me understand AI applications in my industry. The ethical considerations section was especially valuable.'),
(1, 8, 4, 'Well-written and informative. The section on job market impacts was eye-opening.'),

(2, 4, 4, 'Solid social media strategies. The Instagram tips were especially useful for my small business.'),
(2, 5, 3, 'Good content but could use more recent case studies and examples from 2024-2025.'),
(2, 6, 5, 'Fantastic guide! Implemented several strategies and already seeing improved engagement.'),

(3, 4, 5, 'Perfect timing for this article. Remote work tips are practical and immediately applicable.'),
(3, 8, 4, 'Great insights on managing remote teams. The communication strategies section was particularly valuable.'),

(4, 4, 5, 'Cybersecurity is so important these days. This article covers all the basics perfectly and includes actionable steps.'),
(4, 6, 4, 'Very practical advice. I\'ve already implemented several of these security measures for my business.'),
(4, 8, 5, 'Comprehensive coverage of cybersecurity essentials. The business security section was especially helpful.'),

(5, 5, 4, 'Good introduction to cloud computing. Helped me understand the different service models clearly.'),
(5, 6, 3, 'Informative but could use more specific pricing comparisons between providers.'),

(6, 4, 5, 'Excellent guide to data analytics. The visualization section provided great practical tips.'),
(6, 8, 4, 'Well-structured article. The business case studies were particularly enlightening.'),

(7, 5, 4, 'Helpful overview of mobile development trends. The framework comparison was useful.'),
(7, 6, 5, 'Great insights into the future of mobile development. The security section was comprehensive.');

-- Insert sample subscription records to demonstrate subscription management
INSERT INTO subscriptions (user_id, subscription_type, start_date, end_date, amount, status) VALUES
(4, 'yearly', '2024-07-01', '2025-06-30', 99.99, 'active'),
(5, 'yearly', '2024-08-15', '2025-08-15', 99.99, 'active'),
(6, 'monthly', '2024-01-01', '2024-12-31', 9.99, 'expired'),
(8, 'yearly', '2024-09-20', '2025-09-20', 99.99, 'active'),
(4, 'monthly', '2023-07-01', '2024-06-30', 9.99, 'expired'),
(5, 'monthly', '2023-08-15', '2024-08-15', 9.99, 'expired');

-- Verify data was inserted successfully
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Issues' as table_name, COUNT(*) as record_count FROM issues
UNION ALL
SELECT 'Articles' as table_name, COUNT(*) as record_count FROM articles
UNION ALL
SELECT 'Feedback' as table_name, COUNT(*) as record_count FROM feedback
UNION ALL
SELECT 'Subscriptions' as table_name, COUNT(*) as record_count FROM subscriptions;
