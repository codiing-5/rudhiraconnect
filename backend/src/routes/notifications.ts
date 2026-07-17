import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken } from './auth';

const router = Router();

// GET all notifications
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Internal server error fetching notifications.' });
  }
});

// PUT mark notification as read
router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Internal server error updating notification.' });
  }
});

// PUT mark all notifications as read
router.put('/read-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error: any) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Internal server error updating notifications.' });
  }
});

export default router;
