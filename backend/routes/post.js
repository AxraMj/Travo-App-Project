const router = require('express').Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new post
router.post('/', postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get posts by user ID
router.get('/user/:userId', postController.getUserPosts);

// Delete a post
router.delete('/:postId', postController.deletePost);

// Like/unlike a post
router.post('/:postId/like', postController.likePost);

// Add a comment to a post
router.post('/:postId/comment', postController.addComment);

module.exports = router; 