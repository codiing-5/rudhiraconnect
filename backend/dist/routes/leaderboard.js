"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET leaderboard data for current month/year and all-time
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        // 1. Fetch current monthly leaderboard items
        const monthlyList = await db_1.default.leaderboard.findMany({
            where: {
                month: currentMonth,
                year: currentYear,
            },
            orderBy: [
                { totalDonations: 'desc' },
                { bloodBuddyPoints: 'desc' },
            ],
        });
        // 2. Fetch all-time aggregate leaderboard data
        const allLeaderboardItems = await db_1.default.leaderboard.findMany();
        // Group and aggregate by college
        const collegeMap = {};
        allLeaderboardItems.forEach((item) => {
            if (!collegeMap[item.college]) {
                collegeMap[item.college] = {
                    college: item.college,
                    totalDonations: 0,
                    bloodBuddyPoints: 0,
                };
            }
            collegeMap[item.college].totalDonations += item.totalDonations;
            collegeMap[item.college].bloodBuddyPoints += item.bloodBuddyPoints;
        });
        const allTimeList = Object.values(collegeMap).sort((a, b) => {
            if (b.totalDonations !== a.totalDonations) {
                return b.totalDonations - a.totalDonations;
            }
            return b.bloodBuddyPoints - a.bloodBuddyPoints;
        });
        // 3. Fetch top individual "Blood Buddy" referring users based on active invites
        // Count active referred users per user
        const topIndividualBuddies = await db_1.default.bloodBuddy.groupBy({
            by: ['inviterId'],
            where: { status: 'JOINED' },
            _count: {
                inviteeId: true,
            },
            orderBy: {
                _count: {
                    inviteeId: 'desc',
                },
            },
            take: 10,
        });
        // Fetch user details for these top inviteers
        const individualRankings = await Promise.all(topIndividualBuddies.map(async (item) => {
            const user = await db_1.default.user.findUnique({
                where: { id: item.inviterId },
                select: { name: true, college: true, district: true },
            });
            return {
                name: user?.name || 'Anonymous Donor',
                college: user?.college || 'N/A',
                district: user?.district || 'N/A',
                referralCount: item._count.inviteeId,
                points: item._count.inviteeId * 5, // 5 points per active user
            };
        }));
        res.json({
            month: currentMonth,
            year: currentYear,
            monthlyRankings: monthlyList,
            allTimeRankings: allTimeList,
            individualRankings: individualRankings.sort((a, b) => b.points - a.points),
        });
    }
    catch (error) {
        console.error('Fetch leaderboard error:', error);
        res.status(500).json({ message: 'Internal server error fetching leaderboard.' });
    }
});
exports.default = router;
