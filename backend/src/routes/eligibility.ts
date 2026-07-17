import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken } from './auth';

const router = Router();

// POST run eligibility check
router.post('/check', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      age,
      weight,
      lastDonationDate,
      hemoglobin,
      feverLast14Days,
      pregnancyBreastfeeding,
      recentSurgery,
      recentTattooPiercing,
      currentMedication,
      chronicIllness,
    } = req.body;

    // Convert inputs to numbers/booleans
    const userAge = parseInt(age);
    const userWeight = parseFloat(weight);
    const userHb = hemoglobin ? parseFloat(hemoglobin) : null;

    let result = 'ELIGIBLE';
    let reasons: string[] = [];
    let deferralDays = 0;

    // 1. Age (18 - 65)
    if (userAge < 18) {
      result = 'PERMANENT_DEFERRAL';
      reasons.push('You must be at least 18 years old to donate blood.');
    } else if (userAge > 65) {
      result = 'PERMANENT_DEFERRAL';
      reasons.push('The maximum age limit for blood donation is 65 years.');
    }

    // 2. Weight (>= 45 kg)
    if (userWeight < 45) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Weight must be at least 45 kg to donate safely.');
      deferralDays = Math.max(deferralDays, 30); // Check again in a month
    }

    // 3. Last Donation Date (90 days interval)
    if (lastDonationDate) {
      const lastDon = new Date(lastDonationDate);
      const diffTime = Math.abs(Date.now() - lastDon.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 90) {
        if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
        const remaining = 90 - diffDays;
        reasons.push(`It has only been ${diffDays} days since your last donation. You must wait at least 90 days between donations.`);
        deferralDays = Math.max(deferralDays, remaining);
      }
    }

    // 4. Hemoglobin (>= 12.5 g/dL)
    if (userHb !== null && userHb < 12.5) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Hemoglobin level is low (minimum required is 12.5 g/dL).');
      deferralDays = Math.max(deferralDays, 30); // Re-evaluate in 30 days
    }

    // 5. Fever in last 14 days
    if (feverLast14Days) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Recent fever in the last 14 days. You must wait until you are fully recovered.');
      deferralDays = Math.max(deferralDays, 14);
    }

    // 6. Pregnancy / Breastfeeding
    if (pregnancyBreastfeeding) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Pregnancy or breastfeeding. Deferral lasts until 12 months post-delivery/lactation.');
      deferralDays = Math.max(deferralDays, 180); // Default placeholder deferral
    }

    // 7. Recent Surgery
    if (recentSurgery) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Recent surgery. A healing period of 6 months (180 days) is required.');
      deferralDays = Math.max(deferralDays, 180);
    }

    // 8. Recent Tattoo / Piercing
    if (recentTattooPiercing) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Recent tattoo or body piercing. A deferral of 6 months (180 days) is required.');
      deferralDays = Math.max(deferralDays, 180);
    }

    // 9. Current Medication
    if (currentMedication) {
      if (result !== 'PERMANENT_DEFERRAL') result = 'TEMPORARY_DEFERRAL';
      reasons.push('Current medication (antibiotics or other temporary drugs). A 14-day deferral is standard after completing dosage.');
      deferralDays = Math.max(deferralDays, 14);
    }

    // 10. Chronic Illness
    if (chronicIllness) {
      result = 'PERMANENT_DEFERRAL';
      reasons.push('Chronic health condition. For your safety, individuals with chronic illnesses may not be eligible. Please consult a doctor.');
    }

    // Calculate next eligible date
    let nextEligibleDate = new Date();
    if (result === 'ELIGIBLE') {
      nextEligibleDate = new Date(); // Eligible today
    } else if (result === 'TEMPORARY_DEFERRAL') {
      nextEligibleDate.setDate(nextEligibleDate.getDate() + deferralDays);
    } else {
      nextEligibleDate = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000); // 10 years in future representing permanent
    }

    const checkRecord = await prisma.eligibilityCheck.create({
      data: {
        userId,
        age: userAge,
        weight: userWeight,
        lastDonation: lastDonationDate ? new Date(lastDonationDate) : null,
        hemoglobin: userHb,
        result,
        reason: reasons.join('; '),
        nextEligibleDate: result === 'PERMANENT_DEFERRAL' ? null : nextEligibleDate,
      },
    });

    // Create a notification about eligibility check completion
    await prisma.notification.create({
      data: {
        userId,
        title: 'Eligibility Check Completed',
        message: result === 'ELIGIBLE' 
          ? 'Congratulations! You are eligible to donate blood today. Search for a camp near you.' 
          : `Eligibility check complete: You are currently deferred. Reason: ${reasons[0] || 'Check status details.'}`,
      },
    });

    res.status(201).json(checkRecord);
  } catch (error: any) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Internal server error during eligibility check.' });
  }
});

// GET user eligibility history
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const history = await prisma.eligibilityCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(history);
  } catch (error: any) {
    console.error('Fetch eligibility history error:', error);
    res.status(500).json({ message: 'Internal server error fetching history.' });
  }
});

// GET current status (most recent check)
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const lastCheck = await prisma.eligibilityCheck.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(lastCheck || null);
  } catch (error: any) {
    console.error('Fetch current eligibility status error:', error);
    res.status(500).json({ message: 'Internal server error fetching status.' });
  }
});

export default router;
