import express from 'express';
import { getNotifications, markAllAsRead, markAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Notification Routes
//
// All routes require JWT authentication.
// ─────────────────────────────────────────────────────────────────────────────

const router = express.Router();

// GET  /api/notifications           — paginated notification list
router.get('/', protect, getNotifications);

// PATCH /api/notifications/read-all — mark all as read (must come before /:id)
router.patch('/read-all', protect, markAllAsRead);

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch('/:id/read', protect, markAsRead);

export default router;
