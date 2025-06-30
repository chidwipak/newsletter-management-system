// Article model - handles all article-related database operations
// Fixed with proper error handling and SQL query optimization

class Article {
  constructor(db) {
    this.db = db
  }

  // Create a new article
  async create(articleData) {
    const { title, content, summary, author_id, issue_id, featured_image_url, status = "draft" } = articleData

    const query = `
      INSERT INTO articles (title, content, summary, author_id, issue_id, featured_image_url, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    return new Promise((resolve, reject) => {
      this.db.query(
        query,
        [title, content, summary, author_id, issue_id, featured_image_url, status],
        (err, result) => {
          if (err) {
            console.error("❌ Article creation error:", err)
            reject(err)
          } else {
            console.log(`✅ Article created with ID: ${result.insertId}`)
            resolve(result.insertId)
          }
        },
      )
    })
  }

  // Get all articles with author and issue information
  async getAll(status = null) {
    let query = `
      SELECT a.*, u.full_name as author_name, i.title as issue_title, i.issue_number
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN issues i ON a.issue_id = i.id
    `

    const params = []
    if (status) {
      query += " WHERE a.status = ?"
      params.push(status)
    }

    query += " ORDER BY a.created_at DESC"

    return new Promise((resolve, reject) => {
      this.db.query(query, params, (err, results) => {
        if (err) {
          console.error("❌ Get all articles error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Get published articles for subscribers
  async getPublished() {
    const query = `
      SELECT a.*, u.full_name as author_name, i.title as issue_title, i.issue_number,
             AVG(f.rating) as average_rating, COUNT(f.id) as feedback_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN issues i ON a.issue_id = i.id
      LEFT JOIN feedback f ON a.id = f.article_id
      WHERE a.status = 'published' AND (i.status = 'published' OR i.status IS NULL)
      GROUP BY a.id, a.title, a.content, a.summary, a.author_id, a.issue_id, 
               a.featured_image_url, a.status, a.view_count, a.created_at, a.updated_at,
               u.full_name, i.title, i.issue_number
      ORDER BY a.created_at DESC
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Get published articles error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Get article by ID with detailed information
  async getById(id) {
    const query = `
      SELECT a.*, u.full_name as author_name, i.title as issue_title, i.issue_number,
             AVG(f.rating) as average_rating, COUNT(f.id) as feedback_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN issues i ON a.issue_id = i.id
      LEFT JOIN feedback f ON a.id = f.article_id
      WHERE a.id = ?
      GROUP BY a.id, a.title, a.content, a.summary, a.author_id, a.issue_id, 
               a.featured_image_url, a.status, a.view_count, a.created_at, a.updated_at,
               u.full_name, i.title, i.issue_number
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, results) => {
        if (err) {
          console.error("❌ Get article by ID error:", err)
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Update article
  async update(id, articleData) {
    const { title, content, summary, issue_id, featured_image_url, status } = articleData

    const query = `
      UPDATE articles 
      SET title = ?, content = ?, summary = ?, issue_id = ?, featured_image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [title, content, summary, issue_id, featured_image_url, status, id], (err, result) => {
        if (err) {
          console.error("❌ Update article error:", err)
          reject(err)
        } else {
          console.log(`✅ Article updated: ID ${id}`)
          resolve(result.affectedRows > 0)
        }
      })
    })
  }

  // Delete article
  async delete(id) {
    const query = "DELETE FROM articles WHERE id = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, result) => {
        if (err) {
          console.error("❌ Delete article error:", err)
          reject(err)
        } else {
          console.log(`✅ Article deleted: ID ${id}`)
          resolve(result.affectedRows > 0)
        }
      })
    })
  }

  // Increment view count when article is viewed
  async incrementViewCount(id) {
    const query = "UPDATE articles SET view_count = view_count + 1 WHERE id = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, result) => {
        if (err) {
          console.error("❌ Increment view count error:", err)
          reject(err)
        } else {
          resolve(result.affectedRows > 0)
        }
      })
    })
  }

  // Get articles by author
  async getByAuthor(authorId) {
    const query = `
      SELECT a.*, i.title as issue_title, i.issue_number
      FROM articles a
      LEFT JOIN issues i ON a.issue_id = i.id
      WHERE a.author_id = ?
      ORDER BY a.created_at DESC
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [authorId], (err, results) => {
        if (err) {
          console.error("❌ Get articles by author error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }
}

module.exports = Article
