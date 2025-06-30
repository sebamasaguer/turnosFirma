const express = require('express');
const router = express.Router();
const db = require('../db');
// Note: Actual authentication logic (e.g., JWT, password hashing) will be added in a future step or iteration.
// For now, these are placeholders for CRUD operations, assuming auth is handled externally or will be added.
// We will need a proper auth middleware for protected routes.

const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/authUtils');
const authenticateToken = require('../middleware/authenticateToken');

// POST admin login - This route should NOT be protected by authenticateToken itself, as it's for getting the token.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await db.query('SELECT id, email, full_name, password_hash FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' }); // User not found
    }

    const user = result.rows[0];

    // Compare submitted password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Password doesn't match
    }

    // Passwords match, generate JWT
    const token = generateToken({ id: user.id, email: user.email });

    // Send token and user info (excluding password_hash)
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET all admin users - PROTECTED
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // req.user is available here from authenticateToken middleware
    const { rows } = await db.query('SELECT id, email, full_name, created_at FROM admin_users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST a new admin user - PROTECTED
// Consider if this should be open for initial superuser setup or always protected.
router.post('/users', authenticateToken, async (req, res) => {
    const { email, full_name, password } = req.body;
    if (!email || !full_name || !password) {
        return res.status(400).json({ error: 'Email, full name, and password are required' });
    }

    // Optional: Add role-based authorization here (e.g., only superadmin can create)
    // if (req.user.role !== 'superadmin') { return res.status(403).json({ error: 'Forbidden' }); }

    try {
        const existingUser = await db.query('SELECT id FROM admin_users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Admin user with this email already exists.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const queryText = `
            INSERT INTO admin_users (email, full_name, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, email, full_name, created_at;
        `;
        const values = [email, full_name, hashedPassword];
        const { rows } = await db.query(queryText, values);
        const newUser = rows[0];

        res.status(201).json(newUser); // Return only user details, not token (login separately)

    } catch (err) {
        console.error('Error creating admin user:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Admin user with this email already exists.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT (update) an admin user - PROTECTED
router.put('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { email, full_name } = req.body;

    if (!email && !full_name) {
        return res.status(400).json({ error: 'No fields to update provided (email, full_name).' });
    }

    // Optional: Check if the authenticated user is updating their own profile or has permission
    // if (req.user.id !== id && req.user.role !== 'superadmin') {
    //     return res.status(403).json({ error: 'Forbidden' });
    // }

    try {
        const setClauses = [];
        const values = [];
        let paramCount = 1;

        if (email) {
            setClauses.push(`email = $${paramCount++}`);
            values.push(email);
        }
        if (full_name) {
            setClauses.push(`full_name = $${paramCount++}`);
            values.push(full_name);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid update fields provided.' });
        }

        values.push(id);

        const queryText = `
            UPDATE admin_users
            SET ${setClauses.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, email, full_name, created_at;
        `;
        const { rows } = await db.query(queryText, values);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Admin user not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(`Error updating admin user ${id}:`, err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Another admin user with this email already exists.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE an admin user - PROTECTED
router.delete('/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Optional: Add role-based authorization here (e.g., only superadmin can delete)
    // if (req.user.id === id) { // Prevent self-deletion or handle differently
    //    return res.status(403).json({ error: 'Forbidden: Cannot delete own account this way.' });
    // }
    // if (req.user.role !== 'superadmin') {
    //    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    // }

    try {
        const queryText = 'DELETE FROM admin_users WHERE id = $1 RETURNING id, email, full_name;';
        const { rows } = await db.query(queryText, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Admin user not found' });
        }
        res.status(200).json({ message: 'Admin user deleted successfully', deletedUser: rows[0] });
    } catch (err) {
        console.error(`Error deleting admin user ${id}:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET current authenticated admin user details - PROTECTED
router.get('/me', authenticateToken, async (req, res) => {
  // The `authenticateToken` middleware has already verified the token
  // and attached the user payload to `req.user`.
  // The payload typically contains { id, email }.
  // We fetch fresh user details from the DB to ensure they are up-to-date
  // and to avoid returning sensitive info that might have been in an old JWT payload if roles/permissions changed.
  try {
    const userId = req.user.id; // Get user ID from JWT payload (added by authenticateToken)
    const result = await db.query('SELECT id, email, full_name, created_at FROM admin_users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      // This case means the user ID in a valid token doesn't exist in the DB anymore.
      // This could happen if the user was deleted after the token was issued.
      return res.status(404).json({ error: 'Authenticated user not found in database.' });
    }

    const currentUser = result.rows[0];
    res.json(currentUser); // Send back non-sensitive user details

  } catch (err) {
    console.error('Error fetching current admin user (/me):', err);
    res.status(500).json({ error: 'Internal server error while fetching user details' });
  }
});

module.exports = router;
