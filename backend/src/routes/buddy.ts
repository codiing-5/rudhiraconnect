import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken } from './auth';

const router = Router();

// GET all referrals for the logged-in user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const invites = await prisma.bloodBuddy.findMany({
      where: { inviterId: userId },
      include: {
        invitee: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            district: true,
            createdAt: true,
            donations: {
              where: { status: 'VERIFIED' },
              select: { id: true },
            },
          },
        },
      },
    });

    // Format referral tree details
    const tree = invites.map((link) => {
      const hasDonated = link.invitee.donations.length > 0;
      return {
        id: link.id,
        inviteeId: link.invitee.id,
        name: link.invitee.name,
        email: link.invitee.email,
        college: link.invitee.college,
        status: link.status,
        hasDonated,
        joinedDate: link.joinedDate,
      };
    });

    // Calculate Referral Points (e.g. 5 points for joining, 15 points if they donate)
    let totalPoints = 0;
    tree.forEach((buddy) => {
      if (buddy.status === 'JOINED') {
        totalPoints += 5; // Invited user registered
        if (buddy.hasDonated) {
          totalPoints += 15; // Invited user made a verified donation
        }
      }
    });

    res.json({
      referralCode: userId,
      referralLink: `http://localhost:5173/register?ref=${userId}`,
      referrals: tree,
      totalPoints,
    });
  } catch (error: any) {
    console.error('Fetch Blood Buddy info error:', error);
    res.status(500).json({ message: 'Internal server error fetching referral network.' });
  }
});

// POST invite buddy by email
router.post('/invite', authenticateToken, async (req: Request, res: Response) => {
  try {
    const inviterId = (req as any).user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    // Check if user is inviting themselves
    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
    if (inviter && inviter.email.toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot invite yourself to the challenge.' });
    }

    // Check if invitee is already registered
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (invitee) {
      // Check if connection already exists
      const existingLink = await prisma.bloodBuddy.findFirst({
        where: {
          OR: [
            { inviterId, inviteeId: invitee.id },
            { inviterId: invitee.id, inviteeId: inviterId }
          ]
        }
      });

      if (existingLink) {
        return res.status(400).json({ message: 'A referral connection already exists with this user.' });
      }

      // Create joined referral link directly
      const buddy = await prisma.bloodBuddy.create({
        data: {
          inviterId,
          inviteeId: invitee.id,
          status: 'JOINED',
          joinedDate: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId: invitee.id,
          title: 'Connected to Blood Buddy',
          message: `${inviter?.name || 'A user'} has added you to their Blood Buddy network! Complete a donation to earn points for your college.`,
        },
      });

      return res.status(201).json({
        message: `${invitee.name} is already registered! They have been added to your Blood Buddy network.`,
        buddy,
      });
    }

    // If invitee is not registered, we send back a success message simulating sending an email invite.
    // In our app, we'll notify them they can share their referral link: http://localhost:5173/register?ref=userid.
    res.json({
      message: `An invitation email will be sent to ${email}. Share your custom link to ensure they connect!`,
      referralLink: `http://localhost:5173/register?ref=${inviterId}`,
    });
  } catch (error: any) {
    console.error('Invite buddy error:', error);
    res.status(500).json({ message: 'Internal server error processing referral invite.' });
  }
});

// POST link referral at registration
router.post('/link-referral', async (req: Request, res: Response) => {
  try {
    const { inviteeId, inviterId } = req.body;

    if (!inviteeId || !inviterId) {
      return res.status(400).json({ message: 'Inviter and invitee IDs are required.' });
    }

    // Verify both exist
    const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
    const invitee = await prisma.user.findUnique({ where: { id: inviteeId } });

    if (!inviter || !invitee) {
      return res.status(404).json({ message: 'Referral users not found.' });
    }

    // Check if connection already exists
    const existingLink = await prisma.bloodBuddy.findFirst({
      where: {
        OR: [
          { inviterId, inviteeId },
          { inviterId: inviteeId, inviteeId: inviterId }
        ]
      }
    });

    if (existingLink) {
      return res.status(400).json({ message: 'Referral link already established.' });
    }

    // Create Blood Buddy link
    const buddy = await prisma.bloodBuddy.create({
      data: {
        inviterId,
        inviteeId,
        status: 'JOINED',
        joinedDate: new Date(),
      },
    });

    // Notify inviter
    await prisma.notification.create({
      data: {
        userId: inviterId,
        title: 'New Blood Buddy Joined!',
        message: `${invitee.name} has registered using your referral link. Encourage them to donate to unlock more points!`,
      },
    });

    res.status(201).json(buddy);
  } catch (error: any) {
    console.error('Link referral error:', error);
    res.status(500).json({ message: 'Internal server error linking referral.' });
  }
});

export default router;
