require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const guideRoutes = require('./routes/guide');
const postRoutes = require('./routes/post');
const profileRoutes = require('./routes/profile');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guides', auth, guideRoutes);
app.use('/api/posts', auth, postRoutes);
app.use('/api/profiles', auth, profileRoutes);

const PORT = process.env.PORT || 5000;
const YOUR_IP = '192.168.31.117';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
app.listen(PORT, YOUR_IP, () => {
  console.log(`Server running on http://${YOUR_IP}:${PORT}`);
}); 