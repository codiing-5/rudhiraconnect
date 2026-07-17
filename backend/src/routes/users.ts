import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken } from './auth';

const router = Router();

// GET aggregated user profile statistics and badges
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        college: true,
        district: true,
        bloodGroup: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch eligibility checks
    const eligibilityChecks = await prisma.eligibilityCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const lastCheck = eligibilityChecks[0] || null;

    // Fetch camp registrations
    const registrationsCount = await prisma.campRegistration.count({
      where: { userId },
    });

    // Fetch donations
    const donations = await prisma.donation.findMany({
      where: { userId },
      include: { camp: true },
      orderBy: { donationDate: 'desc' },
    });

    const verifiedDonationsCount = donations.filter(d => d.status === 'VERIFIED').length;

    // Fetch certificates
    const certificatesCount = await prisma.certificate.count({
      where: { userId },
    });

    // Fetch Blood Buddy referrals
    const referrals = await prisma.bloodBuddy.findMany({
      where: { inviterId: userId },
      include: {
        invitee: {
          select: {
            donations: {
              where: { status: 'VERIFIED' },
              select: { id: true },
            },
          },
        },
      },
    });

    const joinedReferralsCount = referrals.filter(r => r.status === 'JOINED').length;
    
    // Check if they completed the quiz by looking up the notification
    const hasQuizBadgeNotification = await prisma.notification.findFirst({
      where: {
        userId,
        title: 'Awareness Champion Badge Earned',
      },
    });

    // Dynamic Badge Calculation
    const badges = [];

    // 1. First Step Badge
    if (eligibilityChecks.length > 0) {
      badges.push({
        id: 'first_step',
        title: 'First Step',
        description: 'Completed your first eligibility check.',
        icon: 'Compass',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
      });
    }

    // 2. Quiz Badge
    if (hasQuizBadgeNotification) {
      badges.push({
        id: 'awareness_champion',
        title: 'Awareness Champion',
        description: 'Scored 5/5 on the Blood Donation Quiz.',
        icon: 'BookOpen',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      });
    }

    // 3. Donation Badges
    if (verifiedDonationsCount >= 1) {
      badges.push({
        id: 'red_buddy',
        title: 'Red Buddy',
        description: 'Completed your first verified blood donation.',
        icon: 'Heart',
        color: 'bg-red-100 text-red-800 border-red-200',
      });
    }
    if (verifiedDonationsCount >= 3) {
      badges.push({
        id: 'silver_lifesaver',
        title: 'Silver Lifesaver',
        description: 'Completed 3 verified blood donations.',
        icon: 'Award',
        color: 'bg-slate-200 text-slate-800 border-slate-300',
      });
    }
    if (verifiedDonationsCount >= 5) {
      badges.push({
        id: 'gold_lifesaver',
        title: 'Gold Lifesaver',
        description: 'Completed 5 verified blood donations.',
        icon: 'Award',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
      });
    }

    // 4. Referral Badges
    if (joinedReferralsCount >= 1) {
      badges.push({
        id: 'buddy_starter',
        title: 'Buddy Starter',
        description: 'Invited 1 friend who joined RudhiraConnect.',
        icon: 'UserPlus',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      });
    }
    if (joinedReferralsCount >= 3) {
      badges.push({
        id: 'blood_buddy_master',
        title: 'Buddy Master',
        description: 'Invited 3 friends who joined RudhiraConnect.',
        icon: 'Users',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
      });
    }

    // 5. Active Campaigner
    if (registrationsCount >= 2) {
      badges.push({
        id: 'active_campaigner',
        title: 'Active Campaigner',
        description: 'Registered for 2 or more blood camps.',
        icon: 'Calendar',
        color: 'bg-pink-100 text-pink-800 border-pink-200',
      });
    }

    // Calculate Blood Buddy referral points
    let buddyPoints = 0;
    referrals.forEach((r) => {
      if (r.status === 'JOINED') {
        buddyPoints += 5; // registration
        if (r.invitee.donations.length > 0) {
          buddyPoints += 15; // completed donation
        }
      }
    });

    res.json({
      user,
      stats: {
        eligibilityChecksCount: eligibilityChecks.length,
        campRegistrationsCount: registrationsCount,
        donationsCount: donations.length,
        verifiedDonationsCount,
        certificatesCount,
        referralsCount: referrals.length,
        joinedReferralsCount,
        buddyPoints,
      },
      lastCheck,
      donations,
      badges,
    });
  } catch (error: any) {
    console.error('Fetch profile stats error:', error);
    res.status(500).json({ message: 'Internal server error fetching profile stats.' });
  }
});

export default router;
