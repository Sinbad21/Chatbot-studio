import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@chatbot-studio/database';

const router = Router();
router.use(authenticate);

router.get('/plans', asyncHandler(async (req: AuthRequest, res: Response) => {
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  });
  res.json(plans);
}));

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { organizationId } = req.query;

  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: organizationId as string },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(subscription);
}));

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { organizationId, planId } = req.body;

  const subscription = await prisma.subscription.create({
    data: {
      organizationId,
      planId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  res.status(201).json(subscription);
}));

router.post('/:id/cancel', asyncHandler(async (req: AuthRequest, res: Response) => {
  const subscription = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { cancelAtPeriodEnd: true },
  });

  res.json(subscription);
}));

export default router;
