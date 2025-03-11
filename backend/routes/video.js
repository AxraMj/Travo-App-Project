const router = require('express').Router();
const videoController = require('../controllers/videoController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new video
router.post('/', videoController.createVideo);

// Get all videos
router.get('/', videoController.getAllVideos);

// Get videos by user ID
router.get('/user/:userId', videoController.getUserVideos);

// Like/unlike a video
router.post('/:videoId/like', videoController.likeVideo);

// Add comment to video
router.post('/:videoId/comment', videoController.addComment);

// Delete a video (owner only)
router.delete('/:videoId', videoController.deleteVideo);

// Increment video views
router.post('/:videoId/view', videoController.incrementViews);

module.exports = router; 