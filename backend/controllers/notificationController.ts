import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

// ─────────────────────────────────────────────────────────────────────────────
// Notification Controller
//
// Handles in-app notifications for the authenticated user:
//   - List all notifications (paginated, newest first)
//   - Mark a specific notification as read
//   - Mark all notifications as read
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Get paginated notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 *
 * Query params:
 *   - page  (default: 1)
 *   - limit (default: 20, max: 50)
 */
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { returnDocument: 'after' },
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
