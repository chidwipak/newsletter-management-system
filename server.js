// Main server file - Entry point for the Newsletter Management System
// Fixed to handle database initialization properly and improved error handling

const express = require("express")
const mysql = require("mysql2")
const bcrypt = require("bcrypt")
const session = require("express-session")
const path = require("path")
const { initializeDatabase } = require("./scripts/03-initialize-database")

const app = express()
const PORT = process.env.PORT || 3000

// Global database connection variable
let db

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database with tables and sample data
    console.log("🔄 Starting Newsletter Management System...")
    await initializeDatabase()

    // Create database connection for the application
    db = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Chintu@2006",
      database: process.env.DB_NAME || "newsletter_system",
      timezone: "+00:00", // Use UTC timezone
      dateStrings: true, // Return dates as strings to avoid timezone issues
    })

    // Connect to database with proper error handling
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) {
          console.error("❌ Database connection failed:", err)
          reject(err)
        } else {
          console.log("✅ Connected to MySQL database for application")
          resolve()
        }
      })
    })

    // Middleware setup
    app.use(express.json({ limit: "10mb" }))
    app.use(express.urlencoded({ extended: true, limit: "10mb" }))
    app.use(express.static("public")) // Serve static files from public directory

    // Session configuration for user authentication
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "newsletter-secret-key-change-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Set to true in production with HTTPS
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          httpOnly: true, // Prevent XSS attacks
        },
      }),
    )

    // Make database available to all routes
    app.use((req, res, next) => {
      req.db = db
      next()
    })

    // Import route handlers
    const authRoutes = require("./routes/auth")
    const adminRoutes = require("./routes/admin")
    const editorRoutes = require("./routes/editor")
    const subscriberRoutes = require("./routes/subscriber")
    const publicRoutes = require("./routes/public")

    // Route middleware
    app.use("/auth", authRoutes)
    app.use("/admin", adminRoutes)
    app.use("/editor", editorRoutes)
    app.use("/subscriber", subscriberRoutes)
    app.use("/", publicRoutes)

    // Global error handling middleware
    app.use((err, req, res, next) => {
      console.error("❌ Server Error:", err.stack)

      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV !== "production"

      res.status(500).json({
        error: "Internal server error",
        message: isDevelopment ? err.message : "Something went wrong",
        ...(isDevelopment && { stack: err.stack }),
      })
    })

    // Handle 404 errors
    app.use((req, res) => {
      res.status(404).json({ error: "Route not found" })
    })

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Newsletter Management System running on port ${PORT}`)
      console.log(`📱 Visit http://localhost:${PORT} to access the application`)
      console.log(`\n👥 Demo accounts (password: 'password' for all):`)
      console.log(`   🔑 Admin: admin@newsletter.com`)
      console.log(`   ✏️  Editor: john.editor@newsletter.com`)
      console.log(`   👤 Subscriber: mike@email.com`)
      console.log(`\n🎯 Features available:`)
      console.log(`   • User registration and authentication`)
      console.log(`   • Role-based access control`)
      console.log(`   • Article and issue management`)
      console.log(`   • Feedback and rating system`)
      console.log(`   • Admin dashboard and user management`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    console.error("💡 Make sure MySQL is running and accessible")
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Shutting down server...")
  if (db) {
    db.end(() => {
      console.log("✅ Database connection closed")
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

// Start the server
startServer()

module.exports = app
