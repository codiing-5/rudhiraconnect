import { Router, Request, Response } from 'express';
import prisma from '../db';
import { authenticateToken, requireAdmin } from './auth';

const router = Router();

// GET all articles
router.get('/articles', async (req: Request, res: Response) => {
  try {
    const articles = await prisma.awarenessArticle.findMany({
      orderBy: { publishedAt: 'desc' },
    });
    res.json(articles);
  } catch (error: any) {
    console.error('Fetch articles error:', error);
    res.status(500).json({ message: 'Internal server error fetching articles.' });
  }
});

// GET specific article details
router.get('/articles/:id', async (req: Request, res: Response) => {
  try {
    const article = await prisma.awarenessArticle.findUnique({
      where: { id: req.params.id },
    });
    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }
    res.json(article);
  } catch (error: any) {
    console.error('Fetch article error:', error);
    res.status(500).json({ message: 'Internal server error fetching article.' });
  }
});

// POST upload article (Admin only)
router.post('/articles', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, content, image, video, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required.' });
    }

    const article = await prisma.awarenessArticle.create({
      data: {
        title,
        content,
        image: image || null,
        video: video || null,
        category,
      },
    });

    res.status(201).json(article);
  } catch (error: any) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Internal server error creating article.' });
  }
});

// POST submit quiz
router.post('/quizzes/submit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { answers } = req.body; // expected: { q1: string, q2: string, q3: string, q4: string, q5: string }

    if (!answers) {
      return res.status(400).json({ message: 'Quiz answers are required.' });
    }

    // Correct Answers
    const correctAnswers = {
      q1: '45kg',
      q2: '90days',
      q3: 'no',
      q4: 'oxygen',
      q5: 'onegative',
    };

    let score = 0;
    if (answers.q1 === correctAnswers.q1) score++;
    if (answers.q2 === correctAnswers.q2) score++;
    if (answers.q3 === correctAnswers.q3) score++;
    if (answers.q4 === correctAnswers.q4) score++;
    if (answers.q5 === correctAnswers.q5) score++;

    const passed = score === 5;

    if (passed) {
      // Check if user already got a notification for this badge to prevent duplicates
      const existingBadgeNotification = await prisma.notification.findFirst({
        where: {
          userId,
          title: 'Awareness Champion Badge Earned',
        },
      });

      if (!existingBadgeNotification) {
        // Award the Badge via Notification record
        await prisma.notification.create({
          data: {
            userId,
            title: 'Awareness Champion Badge Earned',
            message: 'Congratulations! You scored 5/5 on the Blood Donation Awareness Quiz and earned the "Awareness Champion" badge!',
          },
        });
      }
    }

    res.json({
      score,
      totalQuestions: 5,
      passed,
      badgeEarned: passed ? 'Awareness Champion' : null,
      message: passed 
        ? 'Perfect score! You have earned the "Awareness Champion" badge.' 
        : `You scored ${score}/5. Review the guidelines and try again to get a perfect score and earn your badge!`,
    });
  } catch (error: any) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Internal server error processing quiz results.' });
  }
});

export default router;
