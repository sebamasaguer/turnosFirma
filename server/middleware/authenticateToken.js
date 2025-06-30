const { verifyToken } = require('../utils/authUtils');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const user = verifyToken(token);

  if (!user) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }

  // Add user payload to request object
  // This allows subsequent route handlers to access user details (e.g., req.user.id, req.user.email)
  req.user = user;
  next(); // Proceed to the next middleware or route handler
};

module.exports = authenticateToken;
