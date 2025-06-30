// Editor routes - handles editor-specific functionality
// Includes article and issue management for editors

const express = require("express")
const { requireEditor } = require("../middleware/auth")
const Article = require("../models/Article")
const Issue = require("../models/Issue")

const router = express.Router()

// Apply editor authentication to all routes
router.use(requireEditor)

// Get editor dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const articleModel = new Article(req.db)
    const issueModel = new Issue(req.db)

    // Get editor's articles and all issues
    const [myArticles, allIssues] = await Promise.all([
      articleModel.getByAuthor(req.session.user.id),
      issueModel.getAll(),
    ])

    res.json({
      myArticles,
      allIssues,
      stats: {
        totalArticles: myArticles.length,
        publishedArticles: myArticles.filter((a) => a.status === "published").length,
        draftArticles: myArticles.filter((a) => a.status === "draft").length,
      },
    })
  } catch (error) {
    console.error("Editor dashboard error:", error)
    res.status(500).json({ error: "Failed to load dashboard data" })
  }
})

// Get all issues for article assignment
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

// Create new issue
router.post("/issues", async (req, res) => {
  try {
    const { title, description, publication_date, cover_image_url, status } = req.body

    if (!title || !publication_date) {
      return res.status(400).json({ error: "Title and publication date are required" })
    }

    const issueModel = new Issue(req.db)
    const nextIssueNumber = await issueModel.getNextIssueNumber()

    const issueId = await issueModel.create({
      title,
      description,
      issue_number: nextIssueNumber,
      publication_date,
      cover_image_url,
      status: status || "draft",
      created_by: req.session.user.id,
    })

    res.status(201).json({
      message: "Issue created successfully",
      issueId: issueId,
    })
  } catch (error) {
    console.error("Create issue error:", error)
    res.status(500).json({ error: "Failed to create issue" })
  }
})

// Update issue
router.put("/issues/:id", async (req, res) => {
  try {
    const issueId = req.params.id
    const { title, description, publication_date, cover_image_url, status } = req.body

    const issueModel = new Issue(req.db)
    const success = await issueModel.update(issueId, {
      title,
      description,
      publication_date,
      cover_image_url,
      status,
    })

    if (success) {
      res.json({ message: "Issue updated successfully" })
    } else {
      res.status(404).json({ error: "Issue not found" })
    }
  } catch (error) {
    console.error("Update issue error:", error)
    res.status(500).json({ error: "Failed to update issue" })
  }
})

// Get all articles (editor can see all)
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

// Get specific article for editing
router.get("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id
    const articleModel = new Article(req.db)
    const article = await articleModel.getById(articleId)

    if (article) {
      res.json(article)
    } else {
      res.status(404).json({ error: "Article not found" })
    }
  } catch (error) {
    console.error("Get article error:", error)
    res.status(500).json({ error: "Failed to fetch article" })
  }
})

// Create new article
router.post("/articles", async (req, res) => {
  try {
    const { title, content, summary, issue_id, featured_image_url, status } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const articleModel = new Article(req.db)
    const articleId = await articleModel.create({
      title,
      content,
      summary,
      author_id: req.session.user.id,
      issue_id,
      featured_image_url,
      status: status || "draft",
    })

    res.status(201).json({
      message: "Article created successfully",
      articleId: articleId,
    })
  } catch (error) {
    console.error("Create article error:", error)
    res.status(500).json({ error: "Failed to create article" })
  }
})

// Update article
router.put("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id
    const { title, content, summary, issue_id, featured_image_url, status } = req.body

    const articleModel = new Article(req.db)
    const success = await articleModel.update(articleId, {
      title,
      content,
      summary,
      issue_id,
      featured_image_url,
      status,
    })

    if (success) {
      res.json({ message: "Article updated successfully" })
    } else {
      res.status(404).json({ error: "Article not found" })
    }
  } catch (error) {
    console.error("Update article error:", error)
    res.status(500).json({ error: "Failed to update article" })
  }
})

// Delete article (only if author or admin)
router.delete("/articles/:id", async (req, res) => {
  try {
    const articleId = req.params.id
    const articleModel = new Article(req.db)

    // Check if user is author or admin
    const article = await articleModel.getById(articleId)
    if (!article) {
      return res.status(404).json({ error: "Article not found" })
    }

    if (article.author_id !== req.session.user.id && req.session.user.role !== "admin") {
      return res.status(403).json({ error: "You can only delete your own articles" })
    }

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

module.exports = router
