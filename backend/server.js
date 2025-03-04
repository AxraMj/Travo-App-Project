require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const guideRoutes = require('./routes/guide');
const auth = require('./middleware/auth');
const profileRoutes = require('./routes/profile');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if cannot connect to database
  });

// Add this before your routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guides', auth, guideRoutes);
app.use('/api/profiles', auth, profileRoutes);

// Add this after your routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.toString() : undefined
  });
});

const PORT = process.env.PORT || 5000;
const YOUR_IP = '192.168.31.117';

app.listen(PORT, YOUR_IP, () => {
  console.log(`Server running on http://${YOUR_IP}:${PORT}`);
}); 