const jwt = require('jsonwebtoken');
// Load environment variables from server/.env
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your server/.env file.");
  process.exit(1); // Exit if no secret is found, as it's critical for security
}

/**
 * Generates a JWT for a given user.
 * @param {object} user - The user object to include in the token payload. Typically contains id and email.
 * @param {string} expiresIn - How long the token should be valid for (e.g., '1h', '7d').
 * @returns {string} The generated JWT.
 */
const generateToken = (user, expiresIn = '1h') => {
  const payload = {
    id: user.id,
    email: user.email,
    // You can add more non-sensitive user data here if needed
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object|null} The decoded payload if the token is valid, otherwise null.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Invalid or expired token:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET // Exporting for potential use elsewhere, though typically not needed outside this module
};
