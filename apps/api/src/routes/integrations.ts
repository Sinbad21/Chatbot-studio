import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@chatbot-studio/database';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const integrations = await prisma.integration.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
  res.json(integrations);
}));

router.get('/configured', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { organizationId } = req.query;

  const configs = await prisma.integrationConfig.findMany({
    where: { organizationId: organizationId as string },
    include: { integration: true },
  });

  res.json(configs);
}));

router.post('/configure', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { organizationId, integrationId, config } = req.body;

  const integrationConfig = await prisma.integrationConfig.upsert({
    where: { organizationId_integrationId: { organizationId, integrationId } },
    create: { organizationId, integrationId, config },
    update: { config },
  });

  res.status(201).json(integrationConfig);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.integrationConfig.delete({ where: { id: req.params.id } });
  res.json({ message: 'Integration removed' });
}));

export default router;
