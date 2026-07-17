"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// GET all camps, optionally filtering by district
router.get('/', async (req, res) => {
    try {
        const district = req.query.district;
        const whereClause = district ? { district } : {};
        const camps = await db_1.default.bloodCamp.findMany({
            where: whereClause,
            orderBy: { date: 'asc' },
        });
        res.json(camps);
    }
    catch (error) {
        console.error('Fetch camps error:', error);
        res.status(500).json({ message: 'Internal server error fetching camps.' });
    }
});
// GET current user's camp registrations
router.get('/my-registrations', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const registrations = await db_1.default.campRegistration.findMany({
            where: { userId },
            include: { camp: true },
            orderBy: { registeredAt: 'desc' },
        });
        res.json(registrations);
    }
    catch (error) {
        console.error('Fetch registrations error:', error);
        res.status(500).json({ message: 'Internal server error fetching registrations.' });
    }
});
// GET specific camp by ID
router.get('/:id', async (req, res) => {
    try {
        const camp = await db_1.default.bloodCamp.findUnique({
            where: { id: req.params.id },
            include: {
                _count: {
                    select: { registrations: true },
                },
            },
        });
        if (!camp) {
            return res.status(404).json({ message: 'Camp not found.' });
        }
        res.json(camp);
    }
    catch (error) {
        console.error('Fetch camp details error:', error);
        res.status(500).json({ message: 'Internal server error fetching camp details.' });
    }
});
// POST register for a camp
router.post('/:id/register', auth_1.authenticateToken, async (req, res) => {
    try {
        const campId = req.params.id;
        const userId = req.user.id;
        // Check if camp exists
        const camp = await db_1.default.bloodCamp.findUnique({ where: { id: campId } });
        if (!camp) {
            return res.status(404).json({ message: 'Camp not found.' });
        }
        // Check if already registered
        const existingRegistration = await db_1.default.campRegistration.findUnique({
            where: {
                userId_campId: {
                    userId,
                    campId,
                },
            },
        });
        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this blood donation camp.' });
        }
        // Register user
        const registration = await db_1.default.campRegistration.create({
            data: {
                userId,
                campId,
            },
        });
        // Create a notification for the user
        await db_1.default.notification.create({
            data: {
                userId,
                title: 'Camp Registration Successful',
                message: `You have successfully registered for the camp "${camp.title}". We look forward to seeing you on ${new Date(camp.date).toLocaleDateString()} at ${camp.time}!`,
            },
        });
        res.status(201).json({
            message: 'Successfully registered for the camp.',
            registration,
        });
    }
    catch (error) {
        console.error('Camp registration error:', error);
        res.status(500).json({ message: 'Internal server error during camp registration.' });
    }
});
// GET registrations list for a specific camp (Admin only)
router.get('/:id/registrations', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const registrations = await db_1.default.campRegistration.findMany({
            where: { campId: req.params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        college: true,
                        district: true,
                        bloodGroup: true,
                    },
                },
            },
        });
        res.json(registrations);
    }
    catch (error) {
        console.error('Fetch camp registrations error:', error);
        res.status(500).json({ message: 'Internal server error fetching registrations.' });
    }
});
// POST create camp (Admin only)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, description, location, district, date, time, organizer, latitude, longitude } = req.body;
        if (!title || !location || !district || !date || !time || !organizer) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }
        const camp = await db_1.default.bloodCamp.create({
            data: {
                title,
                description: description || '',
                location,
                district,
                date: new Date(date),
                time,
                organizer,
                latitude: parseFloat(latitude) || 9.9312,
                longitude: parseFloat(longitude) || 76.2673,
            },
        });
        // Send notifications to all users in the camp's district!
        const usersInDistrict = await db_1.default.user.findMany({
            where: { district, role: 'USER' },
            select: { id: true }
        });
        if (usersInDistrict.length > 0) {
            await db_1.default.notification.createMany({
                data: usersInDistrict.map(u => ({
                    userId: u.id,
                    title: 'New Blood Camp in Your District',
                    message: `A new blood donation camp "${title}" has been scheduled in your district on ${new Date(date).toLocaleDateString()}. Register now!`,
                }))
            });
        }
        res.status(201).json(camp);
    }
    catch (error) {
        console.error('Create camp error:', error);
        res.status(500).json({ message: 'Internal server error creating camp.' });
    }
});
// PUT edit camp (Admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, description, location, district, date, time, organizer, latitude, longitude } = req.body;
        const camp = await db_1.default.bloodCamp.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                location,
                district,
                date: date ? new Date(date) : undefined,
                time,
                organizer,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
            },
        });
        res.json(camp);
    }
    catch (error) {
        console.error('Edit camp error:', error);
        res.status(500).json({ message: 'Internal server error updating camp.' });
    }
});
// DELETE camp (Admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        await db_1.default.bloodCamp.delete({ where: { id: req.params.id } });
        res.json({ message: 'Camp successfully deleted.' });
    }
    catch (error) {
        console.error('Delete camp error:', error);
        res.status(500).json({ message: 'Internal server error deleting camp.' });
    }
});
exports.default = router;
