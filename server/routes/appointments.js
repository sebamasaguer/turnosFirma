const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM appointments ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new appointment
router.post('/', async (req, res) => {
  const {
    user_name,
    user_email,
    user_phone,
    user_dni,
    appointment_date,
    appointment_time,
  } = req.body;

  // Basic validation
  if (!user_name || !user_email || !user_phone || !user_dni || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const queryText = `
      INSERT INTO appointments (user_name, user_email, user_phone, user_dni, appointment_date, appointment_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [user_name, user_email, user_phone, user_dni, appointment_date, appointment_time, 'pending'];
    const { rows } = await db.query(queryText, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (update) an appointment by ID (e.g., to change status)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    user_name,
    user_email,
    user_phone,
    user_dni,
    appointment_date,
    appointment_time,
    status, // Expecting status to be 'pending', 'confirmed', or 'cancelled'
  } = req.body;

  // Basic validation for status
  if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: "Invalid status value. Must be one of 'pending', 'confirmed', 'cancelled'." });
  }

  try {
    // Construct the update query dynamically based on provided fields
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (user_name !== undefined) {
      setClauses.push(`user_name = $${paramCount++}`);
      values.push(user_name);
    }
    if (user_email !== undefined) {
      setClauses.push(`user_email = $${paramCount++}`);
      values.push(user_email);
    }
    if (user_phone !== undefined) {
      setClauses.push(`user_phone = $${paramCount++}`);
      values.push(user_phone);
    }
    if (user_dni !== undefined) {
      setClauses.push(`user_dni = $${paramCount++}`);
      values.push(user_dni);
    }
    if (appointment_date !== undefined) {
      setClauses.push(`appointment_date = $${paramCount++}`);
      values.push(appointment_date);
    }
    if (appointment_time !== undefined) {
      setClauses.push(`appointment_time = $${paramCount++}`);
      values.push(appointment_time);
    }
    if (status !== undefined) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No update fields provided.' });
    }

    values.push(id); // For the WHERE clause

    const queryText = `
      UPDATE appointments
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error updating appointment ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE an appointment by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const queryText = 'DELETE FROM appointments WHERE id = $1 RETURNING *;';
    const { rows } = await db.query(queryText, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    // Typically, a DELETE request responds with 204 No Content if successful and no body.
    // Or, respond with the deleted item if that's preferred.
    res.status(200).json({ message: 'Appointment deleted successfully', deletedAppointment: rows[0] });
  } catch (err) {
    console.error(`Error deleting appointment ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
