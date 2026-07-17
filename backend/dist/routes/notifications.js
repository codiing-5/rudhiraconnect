"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// GET all notifications
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await db_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Internal server error fetching notifications.' });
    }
});
// PUT mark notification as read
router.put('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notification = await db_1.default.notification.findUnique({
            where: { id: req.params.id },
        });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        if (notification.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }
        const updated = await db_1.default.notification.update({
            where: { id: req.params.id },
            data: { read: true },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Internal server error updating notification.' });
    }
});
// PUT mark all notifications as read
router.put('/read-all', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await db_1.default.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        res.json({ message: 'All notifications marked as read.' });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Internal server error updating notifications.' });
    }
});
exports.default = router;
