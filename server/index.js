const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Default to 3001 if not specified

// CORS Configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // If you need to handle cookies or authorization headers
};

app.use(cors(corsOptions)); // Use configured CORS

// Middleware
app.use(express.json()); // Middleware to parse JSON bodies

// Import database query function
const db = require('./db');

// Import route handlers
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Mount routers
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({ message: 'Database connection successful!', time: result.rows[0].now });
  } catch (err) {
    console.error('Error connecting to database', err);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
