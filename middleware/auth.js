// Authentication middleware for role-based access control
// This file contains middleware functions to protect routes based on user roles

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" })
  }
  next()
}

// Check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}

// Check if user has editor or admin role
const requireEditor = (req, res, next) => {
  if (!req.session.user || !["editor", "admin"].includes(req.session.user.role)) {
    return res.status(403).json({ error: "Editor access required" })
  }
  next()
}

// Check if user has subscriber, editor, or admin role (any authenticated user)
const requireSubscriber = (req, res, next) => {
  if (!req.session.user || !["subscriber", "editor", "admin"].includes(req.session.user.role)) {
    return res.status(403).json({ error: "Subscriber access required" })
  }
  next()
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireEditor,
  requireSubscriber,
}
