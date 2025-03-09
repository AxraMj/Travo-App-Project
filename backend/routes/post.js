const router = require('express').Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Public routes (no auth required)
router.get('/', postController.getAllPosts);
router.get('/user/:userId', postController.getUserPosts);

// Protected routes (auth required)
router.use(auth); // Apply auth middleware to all routes below

// Create a new post
router.post('/', postController.createPost);

// Like/unlike a post
router.post('/:postId/like', postController.likePost);

// Save/unsave a post
router.post('/:postId/save', postController.savePost);

// Comment operations
router.post('/:postId/comment', postController.addComment);
router.delete('/:postId/comment/:commentId', postController.deleteComment);

// Delete a post (owner only)
router.delete('/:postId', postController.deletePost);

module.exports = router; 