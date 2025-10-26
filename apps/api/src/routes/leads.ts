import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@chatbot-studio/database';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { campaignId, status } = req.query;

  const leads = await prisma.lead.findMany({
    where: {
      conversation: { bot: { userId: req.user!.userId } },
      ...(campaignId && { campaignId: campaignId as string }),
      ...(status && { status: status as any }),
    },
    include: { conversation: { select: { bot: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(leads);
}));

router.get('/campaigns', asyncHandler(async (req: AuthRequest, res: Response) => {
  const campaigns = await prisma.leadCampaign.findMany({
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(campaigns);
}));

router.post('/campaigns', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { organizationId, name, description, creditsLimit } = req.body;

  const campaign = await prisma.leadCampaign.create({
    data: { organizationId, name, description, creditsLimit: creditsLimit || 100 },
  });

  res.status(201).json(campaign);
}));

router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, score } = req.body;

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: { status, score },
  });

  res.json(lead);
}));

export default router;
