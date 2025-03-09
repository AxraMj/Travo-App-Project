const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    await notificationController.getNotifications(req, res);
  } catch (error) {
    console.error('Notification route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    await notificationController.markAsRead(req, res);
  } catch (error) {
    console.error('Mark as read route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await notificationController.markAllAsRead(req, res);
  } catch (error) {
    console.error('Mark all as read route error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 