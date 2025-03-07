const express = require('express');
const cors = require('cors');
const app = express();
const guideRoutes = require('./routes/guide');

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Make sure the guide routes are properly mounted
app.use('/api/guides', guideRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 