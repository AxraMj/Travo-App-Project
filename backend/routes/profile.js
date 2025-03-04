const router = require('express').Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Get profile
router.get('/:userId', profileController.getProfile);

// Update profile
router.put('/update', profileController.updateProfile);

// Update profile stats
router.put('/stats', profileController.updateStats);

module.exports = router; 