const express = require('express');
const router = express.Router();
const db = require('../db');
// Note: Actual authentication logic (e.g., JWT, password hashing) will be added in a future step or iteration.
// For now, these are placeholders for CRUD operations, assuming auth is handled externally or will be added.
// We will need a proper auth middleware for protected routes.

// Placeholder for authentication middleware - replace with actual implementation
const authenticateAdmin = (req, res, next) => {
  // For now, allow all requests. In a real app, verify JWT or session.
  console.warn('Warning: Admin authentication middleware is a placeholder and not secure.');
  next();
};

// POST admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    // IMPORTANT: This is a mock login.
    // In a real application, you MUST hash passwords and compare the hash.
    // DO NOT store plain text passwords.
    const { rows } = await db.query('SELECT id, email, full_name FROM admin_users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // const user = rows[0];
    // const passwordMatch = await bcrypt.compare(password, user.password_hash); // Example with bcrypt
    // if (!passwordMatch) {
    //   return res.status(401).json({ error: 'Invalid credentials' });
    // }

    // For now, assuming login is successful if user exists.
    // TODO: Implement proper password checking and token generation (JWT).
    res.json({ message: 'Login successful (mock)', user: rows[0], token: 'mock-jwt-token' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET all admin users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, email, full_name, created_at FROM admin_users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new admin user
// For now, this is an open endpoint. In production, it should be protected (e.g., only by superadmin)
router.post('/users', async (req, res) => {
    const { email, full_name, password } = req.body; // Assuming password comes from client for creation
    if (!email || !full_name || !password) {
        return res.status(400).json({ error: 'Email, full name, and password are required' });
    }
    // IMPORTANT: Hash the password before storing it.
    // const hashedPassword = await bcrypt.hash(password, 10); // Example with bcrypt
    // For now, storing plain text - THIS IS NOT SECURE FOR PRODUCTION.
    try {
        const queryText = `
            INSERT INTO admin_users (email, full_name)
            VALUES ($1, $2)
            RETURNING id, email, full_name, created_at;
            -- In a real scenario, you'd insert the hashed_password, not the plain password.
        `;
        // const values = [email, full_name, hashedPassword];
        const values = [email, full_name]; // Storing plain for now, replace with hashed
        const { rows } = await db.query(queryText, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating admin user:', err);
        if (err.code === '23505') { // Unique violation (e.g., email already exists)
            return res.status(409).json({ error: 'Admin user with this email already exists.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT (update) an admin user
router.put('/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { email, full_name } = req.body; // Password updates should be handled separately and securely

    if (!email && !full_name) {
        return res.status(400).json({ error: 'No fields to update provided (email, full_name).' });
    }

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
        if (err.code === '23505') { // Unique violation for email
            return res.status(409).json({ error: 'Another admin user with this email already exists.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE an admin user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
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

module.exports = router;
