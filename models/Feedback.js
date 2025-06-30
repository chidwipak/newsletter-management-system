// Feedback model - handles user feedback and ratings for articles
// Fixed with proper error handling and SQL optimization

class Feedback {
  constructor(db) {
    this.db = db
  }

  // Create or update feedback (one per user per article)
  async createOrUpdate(feedbackData) {
    const { article_id, user_id, rating, comment } = feedbackData

    // Use INSERT ... ON DUPLICATE KEY UPDATE to handle unique constraint
    const query = `
      INSERT INTO feedback (article_id, user_id, rating, comment) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      rating = VALUES(rating), 
      comment = VALUES(comment),
      created_at = CURRENT_TIMESTAMP
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [article_id, user_id, rating, comment], (err, result) => {
        if (err) {
          console.error("❌ Create/update feedback error:", err)
          reject(err)
        } else {
          console.log(`✅ Feedback created/updated for article ${article_id} by user ${user_id}`)
          resolve(result.insertId || result.affectedRows)
        }
      })
    })
  }

  // Get all feedback for an article
  async getByArticle(articleId) {
    const query = `
      SELECT f.*, u.full_name as user_name
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.article_id = ?
      ORDER BY f.created_at DESC
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [articleId], (err, results) => {
        if (err) {
          console.error("❌ Get feedback by article error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Get feedback by user and article (to check if user already gave feedback)
  async getByUserAndArticle(userId, articleId) {
    const query = `
      SELECT * FROM feedback 
      WHERE user_id = ? AND article_id = ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [userId, articleId], (err, results) => {
        if (err) {
          console.error("❌ Get feedback by user and article error:", err)
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Get all feedback (admin function)
  async getAll() {
    const query = `
      SELECT f.*, u.full_name as user_name, a.title as article_title
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN articles a ON f.article_id = a.id
      ORDER BY f.created_at DESC
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Get all feedback error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Get feedback statistics for dashboard
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
      FROM feedback
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Get feedback stats error:", err)
          reject(err)
        } else {
          resolve(results[0])
        }
      })
    })
  }

  // Delete feedback
  async delete(id) {
    const query = "DELETE FROM feedback WHERE id = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, result) => {
        if (err) {
          console.error("❌ Delete feedback error:", err)
          reject(err)
        } else {
          console.log(`✅ Feedback deleted: ID ${id}`)
          resolve(result.affectedRows > 0)
        }
      })
    })
  }

  // Get top rated articles
  async getTopRatedArticles(limit = 10) {
    const query = `
      SELECT a.id, a.title, AVG(f.rating) as average_rating, COUNT(f.id) as feedback_count
      FROM articles a
      INNER JOIN feedback f ON a.id = f.article_id
      WHERE a.status = 'published'
      GROUP BY a.id, a.title
      HAVING COUNT(f.id) >= 1
      ORDER BY average_rating DESC, feedback_count DESC
      LIMIT ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [limit], (err, results) => {
        if (err) {
          console.error("❌ Get top rated articles error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }
}

module.exports = Feedback
