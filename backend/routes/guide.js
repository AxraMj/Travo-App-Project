const router = require('express').Router();
const guideController = require('../controllers/guideController');

// Create guide
router.post('/', guideController.createGuide);

// Get all guides
router.get('/', guideController.getAllGuides);

// Get guides by user
router.get('/user/:userId', guideController.getUserGuides);

// Like guide
router.post('/:guideId/like', guideController.likeGuide);

// Dislike guide
router.post('/:guideId/dislike', guideController.dislikeGuide);

module.exports = router; 