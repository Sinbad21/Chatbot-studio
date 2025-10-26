import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@chatbot-studio/database';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { botId } = req.query;
  const conversations = await prisma.conversation.findMany({
    where: { bot: { userId: req.user!.userId }, ...(botId && { botId: botId as string }) },
    include: { _count: { select: { messages: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(conversations);
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  res.json(conversation);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.conversation.delete({ where: { id: req.params.id } });
  res.json({ message: 'Conversation deleted' });
}));

export default router;
