// Authentication routes - handles user login, registration, and logout
// Fixed with better error handling and proper bcrypt password verification

const express = require("express")
const User = require("../models/User")
const router = express.Router()

// User registration endpoint with comprehensive validation
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body

    // Validate required fields
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        error: "All fields are required",
        details: "Username, email, password, and full name must be provided",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address",
      })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password too weak",
        details: "Password must be at least 6 characters long",
      })
    }

    // Validate username length and format
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        error: "Invalid username",
        details: "Username must be between 3 and 50 characters",
      })
    }

    // Validate role if provided
    const validRoles = ["admin", "editor", "subscriber"]
    const userRole = role || "subscriber"
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        error: "Invalid role",
        details: "Role must be admin, editor, or subscriber",
      })
    }

    const userModel = new User(req.db)

    // Check if user already exists by email
    try {
      const existingUserByEmail = await userModel.findByEmail(email)
      if (existingUserByEmail) {
        return res.status(409).json({
          error: "Email already registered",
          details: "An account with this email address already exists",
        })
      }
    } catch (dbError) {
      console.error("❌ Database error checking email:", dbError)
      return res.status(500).json({
        error: "Database error",
        details: "Unable to verify email availability",
      })
    }

    // Check if username is already taken
    try {
      const existingUserByUsername = await userModel.findByUsername(username)
      if (existingUserByUsername) {
        return res.status(409).json({
          error: "Username already taken",
          details: "Please choose a different username",
        })
      }
    } catch (dbError) {
      console.error("❌ Database error checking username:", dbError)
      return res.status(500).json({
        error: "Database error",
        details: "Unable to verify username availability",
      })
    }

    // Create new user
    const userId = await userModel.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      full_name: full_name.trim(),
      role: userRole,
    })

    console.log(`✅ New user registered: ${email} (${userRole}) - ID: ${userId}`)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: userId,
      role: userRole,
    })
  } catch (error) {
    console.error("❌ Registration error:", error)

    // Handle specific database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Account already exists",
        details: "An account with this email or username already exists",
      })
    }

    res.status(500).json({
      error: "Registration failed",
      details: "An internal error occurred during registration",
    })
  }
})

// User login endpoint with secure authentication
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing credentials",
        details: "Email and password are required",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
        details: "Please provide a valid email address",
      })
    }

    const userModel = new User(req.db)

    // Find user by email
    let user
    try {
      user = await userModel.findByEmail(email.toLowerCase().trim())
    } catch (dbError) {
      console.error("❌ Database error finding user:", dbError)
      return res.status(500).json({
        error: "Database error",
        details: "Unable to verify user credentials",
      })
    }

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "Email or password is incorrect",
      })
    }

    // Verify password
    let isValidPassword = false
    try {
      isValidPassword = await userModel.verifyPassword(password, user.password)
    } catch (passwordError) {
      console.error("❌ Password verification error:", passwordError)
      return res.status(500).json({
        error: "Authentication error",
        details: "Unable to verify password",
      })
    }

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        details: "Email or password is incorrect",
      })
    }

    // Create session with user information
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      subscription_status: user.subscription_status,
      subscription_end_date: user.subscription_end_date,
    }

    console.log(`✅ User logged in: ${user.email} (${user.role}) - ID: ${user.id}`)

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        subscription_status: user.subscription_status,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({
      error: "Login failed",
      details: "An internal error occurred during login",
    })
  }
})

// User logout endpoint
router.post("/logout", (req, res) => {
  const userEmail = req.session.user?.email

  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err)
      return res.status(500).json({
        error: "Logout failed",
        details: "Failed to destroy session",
      })
    }

    console.log(`✅ User logged out: ${userEmail || "unknown"}`)
    res.json({
      success: true,
      message: "Logout successful",
    })
  })
})

// Get current user session
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      user: req.session.user,
    })
  } else {
    res.status(401).json({
      error: "Not authenticated",
      details: "No active session found",
    })
  }
})

// Check authentication status
router.get("/status", (req, res) => {
  res.json({
    authenticated: !!req.session.user,
    user: req.session.user || null,
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
