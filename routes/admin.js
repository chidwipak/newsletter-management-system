// Admin routes - handles admin-specific functionality
// Includes user management, system overview, and administrative controls

const express = require("express")
const { requireAdmin } = require("../middleware/auth")
const User = require("../models/User")
const Article = require("../models/Article")
const Issue = require("../models/Issue")
const Feedback = require("../models/Feedback")

const router = express.Router()

// Apply admin authentication to all routes
router.use(requireAdmin)

// Get admin dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const userModel = new User(req.db)
    const articleModel = new Article(req.db)
    const issueModel = new Issue(req.db)
    const feedbackModel = new Feedback(req.db)

    // Get system statistics
    const [users, articles, issues, feedbackStats] = await Promise.all([
      userModel.getAll(),
      articleModel.getAll(),
      issueModel.getAll(),
      feedbackModel.getStats(),
    ])

    // Calculate user statistics by role
    const userStats = {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      editors: users.filter((u) => u.role === "editor").length,
      subscribers: users.filter((u) => u.role === "subscriber").length,
      active_subscriptions: users.filter((u) => u.subscription_status === "active").length,
    }

    // Calculate article statistics by status
    const articleStats = {
      total: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      draft: articles.filter((a) => a.status === "draft").length,
      archived: articles.filter((a) => a.status === "archived").length,
    }

    // Calculate issue statistics by status
    const issueStats = {
      total: issues.length,
      published: issues.filter((i) => i.status === "published").length,
      draft: issues.filter((i) => i.status === "draft").length,
      archived: issues.filter((i) => i.status === "archived").length,
    }

    res.json({
      userStats,
      articleStats,
      issueStats,
      feedbackStats,
      recentUsers: users.slice(0, 5),
      recentArticles: articles.slice(0, 5),
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    res.status(500).json({ error: "Failed to load dashboard data" })
  }
})

// Get all users
router.get("/users", async (req, res) => {
  try {
    const userModel = new User(req.db)
    const users = await userModel.getAll()
    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id
    const { username, email, full_name, role, subscription_status } = req.body

    const userModel = new User(req.db)
    const success = await userModel.update(userId, {
      username,
      email,
      full_name,
      role,
      subscription_status,
    })

    if (success) {
      res.json({ message: "User updated successfully" })
    } else {
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
})

// Get all articles (admin view)
router.get("/articles", async (req, res) => {
  try {
    const articleModel = new Article(req.db)
    const articles = await articleModel.getAll()
    res.json(articles)
  } catch (error) {
    console.error("Get articles error:", error)
    res.status(500).json({ error: "Failed to fetch articles" })
  }
})

// Delete article
router.delete("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id
    const articleModel = new Article(req.db)

    const success = await articleModel.delete(articleId)

    if (success) {
      res.json({ message: "Article deleted successfully" })
    } else {
      res.status(404).json({ error: "Article not found" })
    }
  } catch (error) {
    console.error("Delete article error:", error)
    res.status(500).json({ error: "Failed to delete article" })
  }
})

// Get all issues (admin view)
router.get("/issues", async (req, res) => {
  try {
    const issueModel = new Issue(req.db)
    const issues = await issueModel.getAll()
    res.json(issues)
  } catch (error) {
    console.error("Get issues error:", error)
    res.status(500).json({ error: "Failed to fetch issues" })
  }
})

// Delete issue
router.delete("/issues/:id", async (req, res) => {
  try {
    const issueId = req.params.id
    const issueModel = new Issue(req.db)

    const success = await issueModel.delete(issueId)

    if (success) {
      res.json({ message: "Issue deleted successfully" })
    } else {
      res.status(404).json({ error: "Issue not found" })
    }
  } catch (error) {
    console.error("Delete issue error:", error)
    res.status(500).json({ error: "Failed to delete issue" })
  }
})

// Get all feedback (admin view)
router.get("/feedback", async (req, res) => {
  try {
    const feedbackModel = new Feedback(req.db)
    const feedback = await feedbackModel.getAll()
    res.json(feedback)
  } catch (error) {
    console.error("Get feedback error:", error)
    res.status(500).json({ error: "Failed to fetch feedback" })
  }
})

// Delete feedback
router.delete("/feedback/:id", async (req, res) => {
  try {
    const feedbackId = req.params.id
    const feedbackModel = new Feedback(req.db)

    const success = await feedbackModel.delete(feedbackId)

    if (success) {
      res.json({ message: "Feedback deleted successfully" })
    } else {
      res.status(404).json({ error: "Feedback not found" })
    }
  } catch (error) {
    console.error("Delete feedback error:", error)
    res.status(500).json({ error: "Failed to delete feedback" })
  }
})

// Get system reports
router.get("/reports", async (req, res) => {
  try {
    const feedbackModel = new Feedback(req.db)
    const topRatedArticles = await feedbackModel.getTopRatedArticles(10)

    res.json({
      topRatedArticles,
    })
  } catch (error) {
    console.error("Get reports error:", error)
    res.status(500).json({ error: "Failed to generate reports" })
  }
})

module.exports = router
