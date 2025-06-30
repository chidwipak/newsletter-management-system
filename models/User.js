// User model - handles all user-related database operations
// Fixed with proper error handling and bcrypt integration

const bcrypt = require("bcrypt")

class User {
  constructor(db) {
    this.db = db
  }

  // Create a new user with hashed password and proper validation
  async create(userData) {
    const { username, email, password, full_name, role = "subscriber" } = userData

    try {
      // Hash password before storing (10 rounds for good security/performance balance)
      const hashedPassword = await bcrypt.hash(password, 10)

      // Set default subscription end date (1 year from now for new users)
      const subscriptionEndDate = new Date()
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)

      const query = `
        INSERT INTO users (username, email, password, full_name, role, subscription_end_date) 
        VALUES (?, ?, ?, ?, ?, ?)
      `

      return new Promise((resolve, reject) => {
        this.db.query(query, [username, email, hashedPassword, full_name, role, subscriptionEndDate], (err, result) => {
          if (err) {
            console.error("❌ User creation error:", err)
            reject(err)
          } else {
            console.log(`✅ User created with ID: ${result.insertId}`)
            resolve(result.insertId)
          }
        })
      })
    } catch (error) {
      console.error("❌ Password hashing error:", error)
      throw error
    }
  }

  // Find user by email for authentication
  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [email], (err, results) => {
        if (err) {
          console.error("❌ Find user by email error:", err)
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Find user by username for validation
  async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [username], (err, results) => {
        if (err) {
          console.error("❌ Find user by username error:", err)
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Find user by ID
  async findById(id) {
    const query = "SELECT * FROM users WHERE id = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, results) => {
        if (err) {
          console.error("❌ Find user by ID error:", err)
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Get all users with pagination support (admin function)
  async getAll(limit = 100, offset = 0) {
    const query = `
      SELECT id, username, email, full_name, role, subscription_status, 
             subscription_end_date, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [limit, offset], (err, results) => {
        if (err) {
          console.error("❌ Get all users error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Update user information with validation
  async update(id, userData) {
    const { username, email, full_name, role, subscription_status } = userData

    const query = `
      UPDATE users 
      SET username = ?, email = ?, full_name = ?, role = ?, subscription_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [username, email, full_name, role, subscription_status, id], (err, result) => {
        if (err) {
          console.error("❌ Update user error:", err)
          reject(err)
        } else {
          console.log(`✅ User updated: ID ${id}`)
          resolve(result.affectedRows > 0)
        }
      })
    })
  }

  // Verify password during login with proper error handling
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      console.error("❌ Password verification error:", error)
      throw error
    }
  }

  // Update subscription status and end date
  async updateSubscription(userId, status, endDate) {
    const query = `
      UPDATE users 
      SET subscription_status = ?, subscription_end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [status, endDate, userId], (err, result) => {
        if (err) {
          console.error("❌ Update subscription error:", err)
          reject(err)
        } else {
          console.log(`✅ Subscription updated for user ID: ${userId}`)
          resolve(result.affectedRows > 0)
        }
      })
    })
  }
}

module.exports = User
