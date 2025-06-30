// Subscriber routes - handles subscriber-specific functionality
// Includes article viewing, feedback submission, and subscription management

const express = require("express")
const { requireSubscriber } = require("../middleware/auth")
const Article = require("../models/Article")
const Issue = require("../models/Issue")
const Feedback = require("../models/Feedback")
const User = require("../models/User")

const router = express.Router()

// Apply subscriber authentication to all routes
router.use(requireSubscriber)

// Get subscriber dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const articleModel = new Article(req.db)
    const issueModel = new Issue(req.db)
    const feedbackModel = new Feedback(req.db)

    // Get published content and user's feedback
    const [articles, issues, topRated] = await Promise.all([
      articleModel.getPublished(),
      issueModel.getPublished(),
      feedbackModel.getTopRatedArticles(5),
    ])

    res.json({
      recentArticles: articles.slice(0, 6),
      recentIssues: issues.slice(0, 3),
      topRatedArticles: topRated,
      userInfo: {
        subscription_status: req.session.user.subscription_status,
        subscription_end_date: req.session.user.subscription_end_date,
      },
    })
  } catch (error) {
    console.error("Subscriber dashboard error:", error)
    res.status(500).json({ error: "Failed to load dashboard data" })
  }
})

// Get all published articles
router.get("/articles", async (req, res) => {
  try {
    const articleModel = new Article(req.db)
    const articles = await articleModel.getPublished()
    res.json(articles)
  } catch (error) {
    console.error("Get articles error:", error)
    res.status(500).json({ error: "Failed to fetch articles" })
  }
})

// Get specific article with feedback
router.get("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id
    const articleModel = new Article(req.db)
    const feedbackModel = new Feedback(req.db)

    // Get article and increment view count
    const [article, feedback] = await Promise.all([
      articleModel.getById(articleId),
      feedbackModel.getByArticle(articleId),
    ])

    if (!article) {
      return res.status(404).json({ error: "Article not found" })
    }

    // Check if article is published or user has access
    if (article.status !== "published" && req.session.user.role === "subscriber") {
      return res.status(403).json({ error: "Article not available" })
    }

    // Increment view count
    await articleModel.incrementViewCount(articleId)

    // Check if user already gave feedback
    const userFeedback = await feedbackModel.getByUserAndArticle(req.session.user.id, articleId)

    res.json({
      article,
      feedback,
      userFeedback,
    })
  } catch (error) {
    console.error("Get article error:", error)
    res.status(500).json({ error: "Failed to fetch article" })
  }
})

// Submit feedback for article
router.post("/articles/:id/feedback", async (req, res) => {
  try {
    const articleId = req.params.id
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    const feedbackModel = new Feedback(req.db)

    // Create or update feedback
    await feedbackModel.createOrUpdate({
      article_id: articleId,
      user_id: req.session.user.id,
      rating: Number.parseInt(rating),
      comment: comment || null,
    })

    res.json({ message: "Feedback submitted successfully" })
  } catch (error) {
    console.error("Submit feedback error:", error)
    res.status(500).json({ error: "Failed to submit feedback" })
  }
})

// Get all published issues
router.get("/issues", async (req, res) => {
  try {
    const issueModel = new Issue(req.db)
    const issues = await issueModel.getPublished()
    res.json(issues)
  } catch (error) {
    console.error("Get issues error:", error)
    res.status(500).json({ error: "Failed to fetch issues" })
  }
})

// Get specific issue with articles
router.get("/issues/:id", async (req, res) => {
  try {
    const issueId = req.params.id
    const issueModel = new Issue(req.db)

    const [issue, articles] = await Promise.all([
      issueModel.getById(issueId),
      issueModel.getArticles(issueId, "published"),
    ])

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    // Check if issue is published or user has access
    if (issue.status !== "published" && req.session.user.role === "subscriber") {
      return res.status(403).json({ error: "Issue not available" })
    }

    res.json({
      issue,
      articles,
    })
  } catch (error) {
    console.error("Get issue error:", error)
    res.status(500).json({ error: "Failed to fetch issue" })
  }
})

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const userModel = new User(req.db)
    const user = await userModel.findById(req.session.user.id)

    if (user) {
      // Remove password from response
      delete user.password
      res.json(user)
    } else {
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { username, full_name } = req.body

    if (!username || !full_name) {
      return res.status(400).json({ error: "Username and full name are required" })
    }

    const userModel = new User(req.db)
    const success = await userModel.update(req.session.user.id, {
      username,
      email: req.session.user.email, // Keep existing email
      full_name,
      role: req.session.user.role, // Keep existing role
      subscription_status: req.session.user.subscription_status, // Keep existing status
    })

    if (success) {
      // Update session data
      req.session.user.username = username
      req.session.user.full_name = full_name

      res.json({ message: "Profile updated successfully" })
    } else {
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// Renew subscription
router.post("/subscription/renew", async (req, res) => {
  try {
    const { subscription_type } = req.body

    if (!["monthly", "yearly"].includes(subscription_type)) {
      return res.status(400).json({ error: "Invalid subscription type" })
    }

    const userModel = new User(req.db)

    // Calculate new end date
    const endDate = new Date()
    if (subscription_type === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    // Update subscription
    const success = await userModel.updateSubscription(req.session.user.id, "active", endDate)

    if (success) {
      // Update session data
      req.session.user.subscription_status = "active"
      req.session.user.subscription_end_date = endDate

      res.json({
        message: "Subscription renewed successfully",
        subscription_end_date: endDate,
      })
    } else {
      res.status(404).json({ error: "User not found" })
    }
  } catch (error) {
    console.error("Renew subscription error:", error)
    res.status(500).json({ error: "Failed to renew subscription" })
  }
})

module.exports = router
