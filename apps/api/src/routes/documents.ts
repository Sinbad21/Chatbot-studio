import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@chatbot-studio/database';
import { processDocument } from '@chatbot-studio/document-processor';

const upload = multer({ dest: '/tmp/uploads/' });
const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { botId } = req.query;
  const documents = await prisma.document.findMany({
    where: { bot: { userId: req.user!.userId }, ...(botId && { botId: botId as string }) },
    orderBy: { createdAt: 'desc' },
  });
  res.json(documents);
}));

router.post('/', upload.single('file'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { botId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Process document
  const processed = await processDocument(file.path, file.mimetype);

  const document = await prisma.document.create({
    data: {
      botId,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: file.path,
      content: processed.text,
      status: 'COMPLETED',
    },
  });

  res.status(201).json(document);
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  res.json({ message: 'Document deleted' });
}));

export default router;
