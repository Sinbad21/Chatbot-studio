import { Response } from 'express';
import { prisma } from '@chatbot-studio/database';
import { AppError } from '../middleware/error-handler';
import { AuthRequest } from '../middleware/auth';
import { emailService, botPublishedTemplate } from '@chatbot-studio/email';

class BotController {
  async list(req: AuthRequest, res: Response) {
    const { organizationId } = req.query;

    const bots = await prisma.bot.findMany({
      where: {
        userId: req.user?.userId,
        ...(organizationId && { organizationId: organizationId as string }),
      },
      include: {
        _count: {
          select: {
            conversations: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bots);
  }

  async create(req: AuthRequest, res: Response) {
    const { name, description, organizationId, systemPrompt, welcomeMessage, color } = req.body;

    const bot = await prisma.bot.create({
      data: {
        name,
        description,
        organizationId,
        userId: req.user!.userId,
        systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
        welcomeMessage: welcomeMessage || 'Hello! How can I help you?',
        color: color || '#6366f1',
      },
    });

    res.status(201).json(bot);
  }

  async get(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const bot = await prisma.bot.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            conversations: true,
            documents: true,
            intents: true,
            faqs: true,
          },
        },
      },
    });

    if (!bot) {
      throw new AppError('Bot not found', 404);
    }

    res.json(bot);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const bot = await prisma.bot.update({
      where: { id },
      data: updateData,
    });

    res.json(bot);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;

    await prisma.bot.delete({
      where: { id },
    });

    res.json({ message: 'Bot deleted successfully' });
  }

  async publish(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const bot = await prisma.bot.update({
      where: { id },
      data: { published: true },
      include: { creator: true },
    });

    // Send notification email
    try {
      await emailService.sendEmail({
        to: bot.creator.email,
        subject: `Your bot "${bot.name}" is now live!`,
        html: botPublishedTemplate(
          bot.creator.name,
          bot.name,
          `${process.env.APP_URL}/bots/${bot.id}`
        ),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    res.json(bot);
  }

  async getIntents(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const intents = await prisma.intent.findMany({
      where: { botId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(intents);
  }

  async createIntent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, patterns, response } = req.body;

    const intent = await prisma.intent.create({
      data: {
        botId: id,
        name,
        patterns,
        response,
      },
    });

    res.status(201).json(intent);
  }

  async getFAQs(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const faqs = await prisma.fAQ.findMany({
      where: { botId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(faqs);
  }

  async createFAQ(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const faq = await prisma.fAQ.create({
      data: {
        botId: id,
        question,
        answer,
        category,
      },
    });

    res.status(201).json(faq);
  }
}

export const botController = new BotController();
