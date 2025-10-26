import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@chatbot-studio/database';

const router = Router();
router.use(authenticate);

router.get('/overview', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { botId, startDate, endDate } = req.query;

  const [conversations, messages, leads] = await Promise.all([
    prisma.conversation.count({
      where: {
        bot: { userId: req.user!.userId },
        ...(botId && { botId: botId as string }),
        ...(startDate && endDate && {
          createdAt: { gte: new Date(startDate as string), lte: new Date(endDate as string) },
        }),
      },
    }),
    prisma.message.count({
      where: {
        conversation: { bot: { userId: req.user!.userId } },
        ...(botId && { conversation: { botId: botId as string } }),
      },
    }),
    prisma.lead.count({
      where: {
        conversation: { bot: { userId: req.user!.userId } },
      },
    }),
  ]);

  res.json({ conversations, messages, leads });
}));

router.get('/metrics', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { botId } = req.query;

  const metrics = await prisma.analytics.findMany({
    where: { bot: { userId: req.user!.userId }, ...(botId && { botId: botId as string }) },
    orderBy: { date: 'desc' },
    take: 30,
  });

  res.json(metrics);
}));

export default router;
