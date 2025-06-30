// Public routes - handles public pages and content accessible without authentication
// Includes home page, public article viewing, and registration forms with proper error handling

const express = require("express")
const path = require("path")
const Article = require("../models/Article")
const Issue = require("../models/Issue")
const Feedback = require("../models/Feedback")

const router = express.Router()

// Serve static HTML pages
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
})

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"))
})

router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register.html"))
})

router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/dashboard.html"))
})

// API endpoint for public content preview with comprehensive error handling
router.get("/api/preview", async (req, res) => {
  try {
    console.log("🔄 Loading preview content...")

    const articleModel = new Article(req.db)
    const issueModel = new Issue(req.db)
    const feedbackModel = new Feedback(req.db)

    // Get limited public content with error handling for each query
    let articles = []
    let issues = []
    let topRated = []

    try {
      articles = await articleModel.getPublished()
      console.log(`✅ Loaded ${articles.length} published articles`)
    } catch (error) {
      console.error("❌ Error loading articles:", error)
      articles = []
    }

    try {
      issues = await issueModel.getPublished()
      console.log(`✅ Loaded ${issues.length} published issues`)
    } catch (error) {
      console.error("❌ Error loading issues:", error)
      issues = []
    }

    try {
      topRated = await feedbackModel.getTopRatedArticles(3)
      console.log(`✅ Loaded ${topRated.length} top-rated articles`)
    } catch (error) {
      console.error("❌ Error loading top-rated articles:", error)
      topRated = []
    }

    // Limit content for preview and ensure safe data
    const previewArticles = articles.slice(0, 3).map((article) => ({
      id: article.id,
      title: article.title || "Untitled Article",
      summary: article.summary || "No summary available",
      author_name: article.author_name || "Unknown Author",
      featured_image_url:
        article.featured_image_url || "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200",
      created_at: article.created_at,
      average_rating: article.average_rating ? Number.parseFloat(article.average_rating) : null,
      view_count: article.view_count || 0,
    }))

    const previewIssues = issues.slice(0, 2).map((issue) => ({
      id: issue.id,
      title: issue.title || "Untitled Issue",
      description: issue.description || "No description available",
      issue_number: issue.issue_number,
      cover_image_url:
        issue.cover_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300",
      publication_date: issue.publication_date,
      article_count: issue.article_count || 0,
    }))

    const previewTopRated = topRated.map((article) => ({
      id: article.id,
      title: article.title || "Untitled Article",
      average_rating: Number.parseFloat(article.average_rating),
      feedback_count: article.feedback_count || 0,
    }))

    console.log("✅ Preview content loaded successfully")

    res.json({
      success: true,
      articles: previewArticles,
      issues: previewIssues,
      topRated: previewTopRated,
      stats: {
        total_articles: articles.length,
        total_issues: issues.length,
        total_ratings: topRated.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Preview content error:", error)
    res.status(500).json({
      error: "Failed to load preview content",
      details: "An internal error occurred while loading content",
      articles: [],
      issues: [],
      topRated: [],
    })
  }
})

// Health check endpoint for monitoring
router.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

// API endpoint to get basic system statistics (public)
router.get("/api/stats", async (req, res) => {
  try {
    const articleModel = new Article(req.db)
    const issueModel = new Issue(req.db)

    // Get basic public statistics
    const [publishedArticles, publishedIssues] = await Promise.all([
      articleModel.getPublished(),
      issueModel.getPublished(),
    ])

    res.json({
      success: true,
      stats: {
        published_articles: publishedArticles.length,
        published_issues: publishedIssues.length,
        last_updated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Stats error:", error)
    res.status(500).json({
      error: "Failed to load statistics",
      stats: {
        published_articles: 0,
        published_issues: 0,
      },
    })
  }
})

module.exports = router
