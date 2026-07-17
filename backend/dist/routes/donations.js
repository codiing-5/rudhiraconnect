"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("./auth");
const router = (0, express_1.Router)();
// GET all donations of the logged-in user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const donations = await db_1.default.donation.findMany({
            where: { userId },
            include: { camp: true },
            orderBy: { donationDate: 'desc' },
        });
        res.json(donations);
    }
    catch (error) {
        console.error('Fetch donations error:', error);
        res.status(500).json({ message: 'Internal server error fetching donations.' });
    }
});
// POST log a donation
router.post('/log', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { campId, donationDate, bloodBank } = req.body;
        if (!donationDate || !bloodBank) {
            return res.status(400).json({ message: 'Donation date and blood bank are required.' });
        }
        const donation = await db_1.default.donation.create({
            data: {
                userId,
                campId: campId || null,
                donationDate: new Date(donationDate),
                bloodBank,
                status: 'PENDING',
            },
        });
        res.status(201).json({
            message: 'Donation logged successfully. Awaiting administrator verification.',
            donation,
        });
    }
    catch (error) {
        console.error('Log donation error:', error);
        res.status(500).json({ message: 'Internal server error logging donation.' });
    }
});
// GET all pending donations (Admin only)
router.get('/pending', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const pending = await db_1.default.donation.findMany({
            where: { status: 'PENDING' },
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
                camp: true,
            },
            orderBy: { donationDate: 'desc' },
        });
        res.json(pending);
    }
    catch (error) {
        console.error('Fetch pending donations error:', error);
        res.status(500).json({ message: 'Internal server error fetching pending donations.' });
    }
});
// PUT verify a donation (Admin only)
router.put('/:id/verify', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const donationId = req.params.id;
        const { status } = req.body; // 'VERIFIED' or 'REJECTED'
        if (status !== 'VERIFIED' && status !== 'REJECTED') {
            return res.status(400).json({ message: 'Invalid verification status.' });
        }
        const donation = await db_1.default.donation.findUnique({
            where: { id: donationId },
            include: { user: true },
        });
        if (!donation) {
            return res.status(404).json({ message: 'Donation log not found.' });
        }
        if (donation.status !== 'PENDING') {
            return res.status(400).json({ message: 'Donation has already been processed.' });
        }
        if (status === 'REJECTED') {
            const updatedDonation = await db_1.default.donation.update({
                where: { id: donationId },
                data: { status: 'REJECTED' },
            });
            await db_1.default.notification.create({
                data: {
                    userId: donation.userId,
                    title: 'Donation Log Rejected',
                    message: `Your blood donation logged for ${new Date(donation.donationDate).toLocaleDateString()} at ${donation.bloodBank} could not be verified by the administrator.`,
                },
            });
            return res.json({ message: 'Donation log rejected.', donation: updatedDonation });
        }
        // Verify donation:
        const certCode = `RC-${Math.floor(100000 + Math.random() * 900000)}-${donation.userId.substring(0, 4).toUpperCase()}`;
        // Update donation status
        const updatedDonation = await db_1.default.donation.update({
            where: { id: donationId },
            data: {
                status: 'VERIFIED',
                certificateUrl: certCode, // use code as key
            },
        });
        // Create Certificate
        const certificate = await db_1.default.certificate.create({
            data: {
                userId: donation.userId,
                donationId: donation.id,
                certificateUrl: certCode,
            },
        });
        // Update college rankings in Leaderboard for current month/year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        if (donation.user.college) {
            // Find or create leaderboard item
            const lb = await db_1.default.leaderboard.findUnique({
                where: {
                    college_month_year: {
                        college: donation.user.college,
                        month: currentMonth,
                        year: currentYear,
                    },
                },
            });
            if (lb) {
                await db_1.default.leaderboard.update({
                    where: { id: lb.id },
                    data: { totalDonations: lb.totalDonations + 1 },
                });
            }
            else {
                await db_1.default.leaderboard.create({
                    data: {
                        college: donation.user.college,
                        totalDonations: 1,
                        bloodBuddyPoints: 0,
                        month: currentMonth,
                        year: currentYear,
                    },
                });
            }
        }
        // If referral exists, award referral (Blood Buddy) points to the inviter!
        const buddyLink = await db_1.default.bloodBuddy.findFirst({
            where: {
                inviteeId: donation.userId,
                status: 'JOINED',
            },
        });
        if (buddyLink) {
            // Find the inviter user
            const inviter = await db_1.default.user.findUnique({
                where: { id: buddyLink.inviterId },
            });
            if (inviter && inviter.college) {
                // Add Blood Buddy points to the inviter's college in the leaderboard
                const inviterLb = await db_1.default.leaderboard.findUnique({
                    where: {
                        college_month_year: {
                            college: inviter.college,
                            month: currentMonth,
                            year: currentYear,
                        },
                    },
                });
                if (inviterLb) {
                    await db_1.default.leaderboard.update({
                        where: { id: inviterLb.id },
                        data: { bloodBuddyPoints: inviterLb.bloodBuddyPoints + 10 }, // 10 points per verified referred donation
                    });
                }
                else {
                    await db_1.default.leaderboard.create({
                        data: {
                            college: inviter.college,
                            totalDonations: 0,
                            bloodBuddyPoints: 10,
                            month: currentMonth,
                            year: currentYear,
                        },
                    });
                }
                // Notify inviter that their buddy has successfully donated and they earned points!
                await db_1.default.notification.create({
                    data: {
                        userId: inviter.id,
                        title: 'Blood Buddy Point Earned!',
                        message: `Your referred buddy, ${donation.user.name}, completed their blood donation! You have earned +10 Blood Buddy points for your college leaderboard.`,
                    },
                });
            }
        }
        // Create user notification
        await db_1.default.notification.create({
            data: {
                userId: donation.userId,
                title: 'Donation Verified & Certificate Issued',
                message: `Congratulations! Your blood donation has been verified. A digital certificate of appreciation has been added to your profile. Thank you for your lifesaving contribution!`,
            },
        });
        res.json({
            message: 'Donation verified successfully.',
            donation: updatedDonation,
            certificate,
        });
    }
    catch (error) {
        console.error('Verify donation error:', error);
        res.status(500).json({ message: 'Internal server error verifying donation.' });
    }
});
// GET all certificates of the logged-in user
router.get('/certificates', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const certs = await db_1.default.certificate.findMany({
            where: { userId },
            include: {
                donation: {
                    include: { camp: true },
                },
            },
            orderBy: { issuedDate: 'desc' },
        });
        res.json(certs);
    }
    catch (error) {
        console.error('Fetch certificates error:', error);
        res.status(500).json({ message: 'Internal server error fetching certificates.' });
    }
});
// GET specific certificate details (publicly viewable or authenticated)
router.get('/certificates/:code', async (req, res) => {
    try {
        const cert = await db_1.default.certificate.findFirst({
            where: { certificateUrl: req.params.code },
            include: {
                user: {
                    select: {
                        name: true,
                        college: true,
                        district: true,
                        bloodGroup: true,
                    },
                },
                donation: {
                    include: { camp: true },
                },
            },
        });
        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found.' });
        }
        res.json(cert);
    }
    catch (error) {
        console.error('Fetch certificate details error:', error);
        res.status(500).json({ message: 'Internal server error fetching certificate details.' });
    }
});
exports.default = router;
