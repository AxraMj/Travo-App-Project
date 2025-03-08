const router = require('express').Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Create a new post
router.post('/', auth, postController.createPost);

// Get all posts
router.get('/', postController.getAllPosts);

// Get posts by user ID
router.get('/user/:userId', postController.getUserPosts);

// Delete a post
router.delete('/:postId', auth, postController.deletePost);

// Like/unlike a post
router.post('/:postId/like', auth, postController.likePost);

// Add a comment to a post
router.post('/:postId/comment', auth, postController.addComment);

module.exports = router; 