# Newsletter/Magazine Management System

A comprehensive web-based platform for managing newsletter and magazine publishing workflows with role-based access control, built using Node.js, MySQL, and Tailwind CSS.

## 🎯 Overview

This Newsletter Management System is designed for academic demonstration purposes, providing a complete solution for managing digital publications. The system supports multiple user roles, content management, subscription tracking, and user feedback collection.

### Key Objectives
- **Role-Based Access Control**: Secure access for Admins, Editors, and Subscribers
- **Content Management**: Create, edit, and publish articles and issues
- **Subscription Management**: Track user subscriptions and renewals
- **Feedback System**: Collect and display user ratings and comments
- **Analytics Dashboard**: Monitor system performance and user engagement

## ✨ Features

### 🔐 Authentication & Authorization
- Secure user registration and login
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control (Admin, Editor, Subscriber)

### 📚 Content Management
- **Issues Management**: Create and manage magazine/newsletter issues
- **Article Publishing**: Write, edit, and publish articles
- **Rich Content Support**: Featured images, summaries, and full content
- **Status Workflow**: Draft → Published → Archived

### 👥 User Management (Admin Only)
- View all registered users
- Update user roles
- Manage user subscriptions
- User analytics and statistics

### 💳 Subscription System
- Monthly and yearly subscription plans
- Subscription status tracking
- Automatic renewal notifications
- Subscription history

### ⭐ Feedback & Rating System
- 5-star rating system for articles
- Comment functionality
- Average rating calculations
- User feedback history

### 📊 Analytics Dashboard (Admin Only)
- System statistics overview
- User distribution charts
- Content performance metrics
- Recent activity monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **bcrypt** - Password hashing
- **express-session** - Session management

### Frontend
- **HTML5** - Markup
- **Tailwind CSS** - Styling framework
- **JavaScript (Vanilla)** - Client-side functionality
- **Lucide Icons** - Icon library

### Architecture
- **MVC Pattern** - Model-View-Controller architecture
- **RESTful API** - Clean API design
- **Responsive Design** - Mobile-friendly interface

## 🗄️ Database Schema

The system uses 5 core tables with proper relationships:

### Tables Overview

\`\`\`sql
users (id, username, email, password, role, full_name, created_at, updated_at)
├── Primary Key: id
├── Unique Keys: username, email
└── Roles: admin, editor, subscriber

issues (id, title, description, publication_date, status, cover_image_url, created_by, created_at, updated_at)
├── Primary Key: id
├── Foreign Key: created_by → users(id)
└── Status: draft, published, archived

articles (id, issue_id, title, content, summary, author_id, status, featured_image_url, created_at, updated_at)
├── Primary Key: id
├── Foreign Key: issue_id → issues(id)
├── Foreign Key: author_id → users(id)
└── Status: draft, published

subscriptions (id, user_id, start_date, end_date, status, subscription_type, created_at, updated_at)
├── Primary Key: id
├── Foreign Key: user_id → users(id)
├── Status: active, expired, cancelled
└── Types: monthly, yearly

feedback (id, article_id, user_id, rating, comment, created_at)
├── Primary Key: id
├── Foreign Key: article_id → articles(id)
├── Foreign Key: user_id → users(id)
├── Unique Key: (user_id, article_id)
└── Rating: 1-5 stars
\`\`\`

### Relationships
- **One-to-Many**: User → Issues (created_by)
- **One-to-Many**: User → Articles (author_id)
- **One-to-Many**: Issue → Articles (issue_id)
- **One-to-Many**: User → Subscriptions (user_id)
- **One-to-Many**: Article → Feedback (article_id)
- **One-to-Many**: User → Feedback (user_id)

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Step 1: Clone Repository
\`\`\`bash
git clone <repository-url>
cd newsletter-management-system
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
npm install express mysql2 bcrypt express-session
\`\`\`

### Step 3: Database Setup
1. Create MySQL database:
\`\`\`sql
CREATE DATABASE newsletter_system;
\`\`\`

2. Run database setup scripts:
\`\`\`bash
# Execute scripts/database-setup.sql in your MySQL client
# Execute scripts/sample-data.sql for demo data
\`\`\`

### Step 4: Environment Configuration
Create a `.env` file in the root directory:
\`\`\`env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=newsletter_system
SESSION_SECRET=your-secret-key-here
\`\`\`

### Step 5: Start Application
\`\`\`bash
npm start
# or
node server.js
\`\`\`

The application will be available at `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `DB_HOST` | MySQL host | localhost | Yes |
| `DB_USER` | MySQL username | root | Yes |
| `DB_PASSWORD` | MySQL password | - | Yes |
| `DB_NAME` | Database name | newsletter_system | Yes |
| `SESSION_SECRET` | Session encryption key | - | Yes |

### Database Configuration
- **Connection Pool**: Single connection (suitable for demo)
- **Character Set**: UTF-8
- **Timezone**: UTC
- **Foreign Key Constraints**: Enabled

## 📖 Usage

### Getting Started

1. **Access the Application**
   - Navigate to `http://localhost:3000`
   - Use demo accounts or register new users

2. **Login Process**
   - Enter username/email and password
   - System redirects to role-appropriate dashboard

3. **Dashboard Navigation**
   - **Issues Tab**: View and manage magazine issues
   - **Articles Tab**: Create and edit articles
   - **Users Tab**: User management (Admin only)
   - **Analytics Tab**: System statistics (Admin only)
   - **My Feedback Tab**: Personal feedback history (Subscriber)
   - **Subscription Tab**: Manage subscriptions (Subscriber)

### Workflow Examples

#### Creating a New Issue (Admin/Editor)
1. Navigate to Issues tab
2. Click "New Issue" button
3. Fill in title, description, publication date
4. Add cover image URL (web-hosted)
5. Save as draft or publish immediately

#### Publishing an Article (Admin/Editor)
1. Navigate to Articles tab
2. Click "New Article" button
3. Select target issue
4. Write title, summary, and content
5. Add featured image URL
6. Set status (draft/published)

#### Leaving Feedback (Subscriber)
1. Browse published articles
2. Click "Leave Feedback" button
3. Select star rating (1-5)
4. Write optional comment
5. Submit feedback

## 🔌 API Endpoints

### Authentication
\`\`\`
POST /auth/register    - User registration
POST /auth/login       - User login
POST /auth/logout      - User logout
GET  /api/user         - Get current user info
\`\`\`

### Issues Management
\`\`\`
GET    /issues         - List all issues
GET    /issues/:id     - Get single issue with articles
POST   /issues         - Create new issue (Admin/Editor)
PUT    /issues/:id     - Update issue (Admin/Editor)
DELETE /issues/:id     - Delete issue (Admin only)
\`\`\`

### Articles Management
\`\`\`
GET    /articles       - List all articles
GET    /articles/:id   - Get single article with feedback
POST   /articles       - Create new article (Admin/Editor)
PUT    /articles/:id   - Update article (Admin/Editor)
DELETE /articles/:id   - Delete article (Admin/Editor)
\`\`\`

### User Management
\`\`\`
GET    /users                    - List all users (Admin only)
PUT    /users/:id/role          - Update user role (Admin only)
GET    /users/:id/subscriptions - Get user subscriptions
POST   /users/:id/subscriptions - Create/renew subscription
\`\`\`

### Feedback System
\`\`\`
GET    /feedback/article/:articleId  - Get article feedback
POST   /feedback/article/:articleId  - Submit feedback
GET    /feedback/my-feedback         - Get user's feedback
DELETE /feedback/:id                 - Delete feedback
\`\`\`

## 👤 User Roles

### 🔴 Admin
**Full System Access**
- User management and role assignment
- Complete content management (CRUD)
- System analytics and reporting
- Subscription management for all users
- Delete any content or user data

**Dashboard Features:**
- Issues, Articles, Users, Analytics tabs
- User role modification
- System statistics overview
- Content performance metrics

### 🟡 Editor
**Content Management**
- Create, edit, and publish issues
- Write and manage articles
- View all content (including drafts)
- Cannot manage users or access analytics

**Dashboard Features:**
- Issues and Articles tabs
- Content creation and editing tools
- Can edit own articles only (unless admin)

### 🟢 Subscriber
**Content Consumption**
- View published issues and articles
- Leave feedback and ratings
- Manage personal subscription
- View personal feedback history

**Dashboard Features:**
- Issues, Articles, My Feedback, Subscription tabs
- Read-only access to published content
- Feedback submission interface
- Subscription management tools

## 🎭 Demo Accounts

The system comes pre-loaded with demo accounts for testing:

### Admin Account
- **Username**: `admin_user`
- **Password**: `password`
- **Email**: `admin@newsletter.com`
- **Access**: Full system administration

### Editor Account
- **Username**: `editor_john`
- **Password**: `password`
- **Email**: `john.editor@newsletter.com`
- **Access**: Content creation and management

### Subscriber Account
- **Username**: `subscriber_mike`
- **Password**: `password`
- **Email**: `mike@email.com`
- **Access**: Content viewing and feedback

> **Note**: In production, these passwords should be changed immediately and use strong, unique passwords.

## 📸 Screenshots

### Home Page
- Clean, professional landing page
- Feature highlights and benefits
- Call-to-action buttons for registration
- Latest issues showcase

### Login/Register
- Secure authentication forms
- Demo account quick-access buttons
- Form validation and error handling
- Responsive design for all devices

### Admin Dashboard
- Comprehensive analytics overview
- User management interface
- Content statistics and metrics
- System health monitoring

### Editor Dashboard
- Content creation tools
- Issue and article management
- Publishing workflow interface
- Draft and published content views

### Subscriber Dashboard
- Published content browsing
- Feedback submission interface
- Subscription management
- Personal activity history

## 🔧 Development

### Project Structure
\`\`\`
newsletter-management-system/
├── server.js                 # Main server file
├── routes/                   # API route handlers
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── issues.js            # Issues management routes
│   ├── articles.js          # Articles management routes
│   └── feedback.js          # Feedback system routes
├── views/                   # HTML templates
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   └── dashboard.html       # Main dashboard
├── scripts/                 # Database scripts
│   ├── database-setup.sql   # Table creation
│   └── sample-data.sql      # Demo data
├── public/                  # Static assets (if needed)
├── package.json             # Dependencies
└── README.md               # This file
\`\`\`

### Code Standards
- **ES6+** JavaScript features
- **Async/Await** for database operations
- **Error Handling** with try-catch blocks
- **SQL Comments** explaining queries and relationships
- **Responsive Design** with Tailwind CSS
- **Security Best Practices** for authentication

### Database Best Practices
- **Foreign Key Constraints** for data integrity
- **Indexes** on frequently queried columns
- **Proper Data Types** for optimal storage
- **Normalized Schema** to reduce redundancy
- **Transaction Support** for critical operations

## 🚨 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure session cookies
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

### Access Control
- **Role-Based Permissions**: Strict role enforcement
- **Route Protection**: Authentication middleware
- **Resource Ownership**: Users can only modify their own content
- **Admin Privileges**: Separate admin-only functions

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
\`\`\`bash
Error: Database connection failed: ER_ACCESS_DENIED_FOR_USER
\`\`\`
**Solution**: Check database credentials in environment variables

#### Session Store Warnings
\`\`\`bash
Warning: connect.session() MemoryStore is not designed for production
\`\`\`
**Solution**: This is expected for demo purposes. In production, use Redis or database session store.

#### Port Already in Use
\`\`\`bash
Error: listen EADDRINUSE: address already in use :::3000
\`\`\`
**Solution**: Change PORT in environment variables or kill existing process

#### Missing Dependencies
\`\`\`bash
Error: Cannot find module 'express'
\`\`\`
**Solution**: Run `npm install` to install all dependencies

### Performance Optimization

#### Database Optimization
- Add indexes on frequently queried columns
- Use connection pooling for multiple concurrent users
- Implement query caching for static content
- Regular database maintenance and optimization

#### Frontend Optimization
- Implement pagination for large content lists
- Add loading states for better user experience
- Optimize images and use CDN for static assets
- Implement client-side caching

## 📚 Additional Resources

### Learning Materials
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Deployment Guides
- [Deploying to Heroku](https://devcenter.heroku.com/articles/deploying-nodejs)
- [Deploying to DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-node-js-application-on-ubuntu)
- [Database Hosting Options](https://planetscale.com/docs)

## 🤝 Contributing

This project is designed for academic purposes, but contributions are welcome:

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/new-feature`
3. **Commit Changes**: `git commit -m 'Add new feature'`
4. **Push to Branch**: `git push origin feature/new-feature`
5. **Submit Pull Request**

### Contribution Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting
- Include database migration scripts if needed

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and distribute for academic and learning purposes.


## 🎓 Academic Notes

This project demonstrates:

- **Database Design**: Proper normalization and relationships
- **Web Development**: Full-stack application architecture
- **Security Implementation**: Authentication and authorization
- **User Experience**: Role-based interface design
- **Code Organization**: MVC pattern and clean code practices

**Perfect for**: Database management courses, web development projects, software engineering demonstrations, and full-stack development learning.

---

*Built with ❤️ for educational purposes*
