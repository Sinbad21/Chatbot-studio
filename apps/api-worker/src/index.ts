import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors({
  origin: ['https://chatbot-studio.pages.dev', 'http://localhost:3000'],
  credentials: true,
}));

// Database connection helper
const getDB = (databaseUrl: string) => {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
};

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Chatbot Studio API'
  });
});

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/v1/auth/register', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const { email, password, name } = await c.req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tokenId: user.id },
      c.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/v1/auth/login', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const { email, password } = await c.req.json();

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      c.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, tokenId: user.id },
      c.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// BOT ROUTES
// ============================================

app.get('/api/v1/bots', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');

    const bots = await prisma.bot.findMany({
      where: { userId: user.userId },
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

    return c.json(bots);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/api/v1/bots', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');
    const { name, description, organizationId, systemPrompt, welcomeMessage, color } = await c.req.json();

    const bot = await prisma.bot.create({
      data: {
        name,
        description,
        organizationId,
        userId: user.userId,
        systemPrompt: systemPrompt || 'You are a helpful AI assistant.',
        welcomeMessage: welcomeMessage || 'Hello! How can I help you?',
        color: color || '#6366f1',
      },
    });

    return c.json(bot, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/v1/bots/:id', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const id = c.req.param('id');

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
      return c.json({ error: 'Bot not found' }, 404);
    }

    return c.json(bot);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// CHAT ROUTES (PUBLIC)
// ============================================

app.post('/api/v1/chat', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const { botId, message, sessionId, metadata } = await c.req.json();

    // Get bot
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { intents: true, faqs: true },
    });

    if (!bot || !bot.published) {
      return c.json({ error: 'Bot not found or not published' }, 404);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { botId, sessionId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          botId,
          sessionId,
          source: metadata?.source || 'widget',
          metadata,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: 'USER',
      },
    });

    // Simple intent matching
    let response = bot.welcomeMessage;

    for (const intent of bot.intents) {
      if (intent.enabled && intent.patterns.some(p => message.toLowerCase().includes(p.toLowerCase()))) {
        response = intent.response;
        break;
      }
    }

    // FAQ matching
    for (const faq of bot.faqs) {
      if (faq.enabled && message.toLowerCase().includes(faq.question.toLowerCase())) {
        response = faq.answer;
        break;
      }
    }

    // Save bot response
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: response,
        role: 'ASSISTANT',
      },
    });

    return c.json({
      message: response,
      conversationId: conversation.id,
      botName: bot.name,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/v1/chat/:botId/config', async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const botId = c.req.param('botId');

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        avatar: true,
        welcomeMessage: true,
        color: true,
        published: true,
      },
    });

    if (!bot || !bot.published) {
      return c.json({ error: 'Bot not found or not published' }, 404);
    }

    return c.json(bot);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

app.get('/api/v1/analytics/overview', authMiddleware, async (c) => {
  try {
    const prisma = getDB(c.env.DATABASE_URL);
    const user = c.get('user');

    const [conversations, messages, leads] = await Promise.all([
      prisma.conversation.count({
        where: { bot: { userId: user.userId } },
      }),
      prisma.message.count({
        where: { conversation: { bot: { userId: user.userId } } },
      }),
      prisma.lead.count({
        where: { conversation: { bot: { userId: user.userId } } },
      }),
    ]);

    return c.json({ conversations, messages, leads });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
