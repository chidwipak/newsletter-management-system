// Issue model - handles magazine/newsletter issue operations
// Fixed with proper error handling and SQL optimization

class Issue {
  constructor(db) {
    this.db = db
  }

  // Create a new issue
  async create(issueData) {
    const {
      title,
      description,
      issue_number,
      publication_date,
      cover_image_url,
      status = "draft",
      created_by,
    } = issueData

    const query = `
      INSERT INTO issues (title, description, issue_number, publication_date, cover_image_url, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    return new Promise((resolve, reject) => {
      this.db.query(
        query,
        [title, description, issue_number, publication_date, cover_image_url, status, created_by],
        (err, result) => {
          if (err) {
            console.error("❌ Issue creation error:", err)
            reject(err)
          } else {
            console.log(`✅ Issue created with ID: ${result.insertId}`)
            resolve(result.insertId)
          }
        },
      )
    })
  }

  // Get all issues with creator information
  async getAll(status = null) {
    let query = `
      SELECT i.*, u.full_name as creator_name,
             COUNT(a.id) as article_count
      FROM issues i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN articles a ON i.id = a.issue_id
    `

    const params = []
    if (status) {
      query += " WHERE i.status = ?"
      params.push(status)
    }

    query +=
      " GROUP BY i.id, i.title, i.description, i.issue_number, i.publication_date, i.cover_image_url, i.status, i.created_by, i.created_at, i.updated_at, u.full_name ORDER BY i.publication_date DESC"

    return new Promise((resolve, reject) => {
      this.db.query(query, params, (err, results) => {
        if (err) {
          console.error("❌ Get all issues error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Get published issues for subscribers
  async getPublished() {
    const query = `
      SELECT i.*, u.full_name as creator_name,
             COUNT(a.id) as article_count
      FROM issues i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN articles a ON i.id = a.issue_id AND a.status = 'published'
      WHERE i.status = 'published'
      GROUP BY i.id, i.title, i.description, i.issue_number, i.publication_date, i.cover_image_url, i.status, i.created_by, i.created_at, i.updated_at, u.full_name
      ORDER BY i.publication_date DESC
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Get published issues error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Get issue by ID with articles
  async getById(id) {
    const query = `
      SELECT i.*, u.full_name as creator_name
      FROM issues i
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, results) => {
        if (err) {
          console.error("❌ Get issue by ID error:", err)
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      })
    })
  }

  // Get articles for a specific issue
  async getArticles(issueId, status = null) {
    let query = `
      SELECT a.*, u.full_name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.issue_id = ?
    `

    const params = [issueId]
    if (status) {
      query += " AND a.status = ?"
      params.push(status)
    }

    query += " ORDER BY a.created_at DESC"

    return new Promise((resolve, reject) => {
      this.db.query(query, params, (err, results) => {
        if (err) {
          console.error("❌ Get issue articles error:", err)
          reject(err)
        } else {
          resolve(results)
        }
      })
    })
  }

  // Update issue
  async update(id, issueData) {
    const { title, description, issue_number, publication_date, cover_image_url, status } = issueData

    const query = `
      UPDATE issues 
      SET title = ?, description = ?, issue_number = ?, publication_date = ?, cover_image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    return new Promise((resolve, reject) => {
      this.db.query(
        query,
        [title, description, issue_number, publication_date, cover_image_url, status, id],
        (err, result) => {
          if (err) {
            console.error("❌ Update issue error:", err)
            reject(err)
          } else {
            console.log(`✅ Issue updated: ID ${id}`)
            resolve(result.affectedRows > 0)
          }
        },
      )
    })
  }

  // Delete issue (will cascade delete articles)
  async delete(id) {
    const query = "DELETE FROM issues WHERE id = ?"

    return new Promise((resolve, reject) => {
      this.db.query(query, [id], (err, result) => {
        if (err) {
          console.error("❌ Delete issue error:", err)
          reject(err)
        } else {
          console.log(`✅ Issue deleted: ID ${id}`)
          resolve(result.affectedRows > 0)
        }
      })
    })
  }

  // Get next issue number
  async getNextIssueNumber() {
    const query = "SELECT MAX(issue_number) as max_number FROM issues"

    return new Promise((resolve, reject) => {
      this.db.query(query, (err, results) => {
        if (err) {
          console.error("❌ Get next issue number error:", err)
          reject(err)
        } else {
          const maxNumber = results[0].max_number || 0
          resolve(maxNumber + 1)
        }
      })
    })
  }
}

module.exports = Issue
