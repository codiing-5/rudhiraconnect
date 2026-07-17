import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken, requireAdmin } from './auth';

const router = Router();

// GET all donations of the logged-in user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const donations = await prisma.donation.findMany({
      where: { userId },
      include: { camp: true },
      orderBy: { donationDate: 'desc' },
    });

    res.json(donations);
  } catch (error: any) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ message: 'Internal server error fetching donations.' });
  }
});

// POST log a donation
router.post('/log', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { campId, donationDate, bloodBank } = req.body;

    if (!donationDate || !bloodBank) {
      return res.status(400).json({ message: 'Donation date and blood bank are required.' });
    }

    const donation = await prisma.donation.create({
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
  } catch (error: any) {
    console.error('Log donation error:', error);
    res.status(500).json({ message: 'Internal server error logging donation.' });
  }
});

// GET all pending donations (Admin only)
router.get('/pending', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pending = await prisma.donation.findMany({
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
  } catch (error: any) {
    console.error('Fetch pending donations error:', error);
    res.status(500).json({ message: 'Internal server error fetching pending donations.' });
  }
});

// PUT verify a donation (Admin only)
router.put('/:id/verify', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const donationId = req.params.id;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'

    if (status !== 'VERIFIED' && status !== 'REJECTED') {
      return res.status(400).json({ message: 'Invalid verification status.' });
    }

    const donation = await prisma.donation.findUnique({
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
      const updatedDonation = await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'REJECTED' },
      });

      await prisma.notification.create({
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
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        status: 'VERIFIED',
        certificateUrl: certCode, // use code as key
      },
    });

    // Create Certificate
    const certificate = await prisma.certificate.create({
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
      const lb = await prisma.leaderboard.findUnique({
        where: {
          college_month_year: {
            college: donation.user.college,
            month: currentMonth,
            year: currentYear,
          },
        },
      });

      if (lb) {
        await prisma.leaderboard.update({
          where: { id: lb.id },
          data: { totalDonations: lb.totalDonations + 1 },
        });
      } else {
        await prisma.leaderboard.create({
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
    const buddyLink = await prisma.bloodBuddy.findFirst({
      where: {
        inviteeId: donation.userId,
        status: 'JOINED',
      },
    });

    if (buddyLink) {
      // Find the inviter user
      const inviter = await prisma.user.findUnique({
        where: { id: buddyLink.inviterId },
      });

      if (inviter && inviter.college) {
        // Add Blood Buddy points to the inviter's college in the leaderboard
        const inviterLb = await prisma.leaderboard.findUnique({
          where: {
            college_month_year: {
              college: inviter.college,
              month: currentMonth,
              year: currentYear,
            },
          },
        });

        if (inviterLb) {
          await prisma.leaderboard.update({
            where: { id: inviterLb.id },
            data: { bloodBuddyPoints: inviterLb.bloodBuddyPoints + 10 }, // 10 points per verified referred donation
          });
        } else {
          await prisma.leaderboard.create({
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
        await prisma.notification.create({
          data: {
            userId: inviter.id,
            title: 'Blood Buddy Point Earned!',
            message: `Your referred buddy, ${donation.user.name}, completed their blood donation! You have earned +10 Blood Buddy points for your college leaderboard.`,
          },
        });
      }
    }

    // Create user notification
    await prisma.notification.create({
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
  } catch (error: any) {
    console.error('Verify donation error:', error);
    res.status(500).json({ message: 'Internal server error verifying donation.' });
  }
});

// GET all certificates of the logged-in user
router.get('/certificates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const certs = await prisma.certificate.findMany({
      where: { userId },
      include: {
        donation: {
          include: { camp: true },
        },
      },
      orderBy: { issuedDate: 'desc' },
    });

    res.json(certs);
  } catch (error: any) {
    console.error('Fetch certificates error:', error);
    res.status(500).json({ message: 'Internal server error fetching certificates.' });
  }
});

// GET specific certificate details (publicly viewable or authenticated)
router.get('/certificates/:code', async (req: Request, res: Response) => {
  try {
    const cert = await prisma.certificate.findFirst({
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
  } catch (error: any) {
    console.error('Fetch certificate details error:', error);
    res.status(500).json({ message: 'Internal server error fetching certificate details.' });
  }
});

export default router;
