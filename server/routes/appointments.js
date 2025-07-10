const express = require('express');
const router = express.Router();
const db = require('../db');

// GET appointments with optional filtering by date and status
router.get('/', async (req, res) => {
  const { appointment_date, status, sortBy, order = 'ASC' } = req.query;

  let queryText = 'SELECT * FROM appointments';
  const values = [];
  const conditions = [];
  let paramCount = 1;

  if (appointment_date) {
    conditions.push(`appointment_date = $${paramCount++}`);
    values.push(appointment_date);
  }
  if (status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(status);
  }

  if (conditions.length > 0) {
    queryText += ' WHERE ' + conditions.join(' AND ');
  }

  // Sorting
  const allowedSortByFields = ['created_at', 'appointment_date', 'user_name', 'status'];
  const sortField = allowedSortByFields.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  queryText += ` ORDER BY ${sortField} ${sortOrder}, appointment_time ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}`;


  try {
    const { rows } = await db.query(queryText, values);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching appointments:', err, { query: queryText, values });
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

  // Enhanced Validation
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    errors.push('Invalid email format.');
  }

  const dniRegex = /^\d{7,8}$/; // Assuming DNI is 7 or 8 digits
  if (!dniRegex.test(user_dni)) {
    errors.push('Invalid DNI format. Must be 7 or 8 digits.');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
  if (!dateRegex.test(appointment_date)) {
    errors.push('Invalid appointment_date format. Must be YYYY-MM-DD.');
  } else {
    const dateParts = appointment_date.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10); // 1-12
    const day = parseInt(dateParts[2], 10);
    const d = new Date(year, month - 1, day);
    if (!(d && (d.getMonth() + 1) === month && d.getDate() === day && d.getFullYear() === year)) {
        errors.push('Invalid date values in appointment_date.');
    }
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM
  if (!timeRegex.test(appointment_time)) {
    errors.push('Invalid appointment_time format. Must be HH:MM.');
  }

  // Validate phone (very basic, just checks if not empty, can be improved)
  if (user_phone.trim() === '') {
      errors.push('Phone number cannot be empty.');
  }


  if (errors.length > 0) {
    return res.status(400).json({ errors });
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
  const { id } = req.params;
  const updates = req.body;

  // Define allowed fields for update to prevent malicious inputs
  const allowedFields = {
    user_name: 'user_name',
    user_email: 'user_email',
    user_phone: 'user_phone',
    user_dni: 'user_dni',
    appointment_date: 'appointment_date',
    appointment_time: 'appointment_time',
    status: 'status',
  };

  const setClauses = [];
  const values = [];
  let paramCount = 1;
  const validationErrors = [];

  for (const key in updates) {
    if (updates.hasOwnProperty(key) && allowedFields[key]) {
      const value = updates[key];
      // Validate specific fields if they are being updated
      if (key === 'user_email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          validationErrors.push('Invalid email format.');
        }
      }
      if (key === 'user_dni') {
        const dniRegex = /^\d{7,8}$/;
        if (!dniRegex.test(value)) {
          validationErrors.push('Invalid DNI format. Must be 7 or 8 digits.');
        }
      }
      if (key === 'appointment_date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          validationErrors.push('Invalid appointment_date format. Must be YYYY-MM-DD.');
        } else {
          const dateParts = value.split('-');
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10);
          const day = parseInt(dateParts[2], 10);
          const d = new Date(year, month - 1, day);
          if (!(d && (d.getMonth() + 1) === month && d.getDate() === day && d.getFullYear() === year)) {
            validationErrors.push('Invalid date values in appointment_date.');
          }
        }
      }
      if (key === 'appointment_time') {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(value)) {
          validationErrors.push('Invalid appointment_time format. Must be HH:MM.');
        }
      }
      if (key === 'user_phone' && String(value).trim() === '') {
         validationErrors.push('Phone number cannot be empty if provided.');
      }
      if (key === 'status') {
        if (!['pending', 'confirmed', 'cancelled'].includes(value)) {
          validationErrors.push("Invalid status value. Must be one of 'pending', 'confirmed', 'cancelled'.");
        }
      }

      setClauses.push(`${allowedFields[key]} = $${paramCount++}`);
      values.push(value);
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No valid update fields provided.' });
  }

  values.push(id); // For the WHERE clause

  const queryText = `
    UPDATE appointments
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *;
  `;

  try {
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
