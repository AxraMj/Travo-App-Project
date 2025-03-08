const router = require('express').Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Get profile by user ID
router.get('/:userId', profileController.getProfile);

// Update profile (requires auth)
router.put('/update', auth, profileController.updateProfile);

// Update profile stats (requires auth)
router.put('/stats', auth, profileController.updateStats);

module.exports = router; 