import { Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '@chatbot-studio/database';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@chatbot-studio/auth';
import { emailService, welcomeTemplate } from '@chatbot-studio/email';
import { AppError } from '../middleware/error-handler';
import { AuthRequest } from '../middleware/auth';

class AuthController {
  async register(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: user.id, // Simplified, should use separate token ID
    });

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send welcome email
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Welcome to Chatbot Studio!',
        html: welcomeTemplate(name),
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }

  async login(req: AuthRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: user.id,
    });

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }

  async refresh(req: AuthRequest, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ accessToken });
  }

  async logout(req: AuthRequest, res: Response) {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({ message: 'Logged out successfully' });
  }

  async me(req: AuthRequest, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user);
  }

  async forgotPassword(req: AuthRequest, res: Response) {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    res.json({ message: 'If the email exists, a reset link has been sent' });

    // TODO: Generate reset token and send email
  }

  async resetPassword(req: AuthRequest, res: Response) {
    const { token, password } = req.body;

    // TODO: Verify reset token and update password

    res.json({ message: 'Password reset successfully' });
  }
}

export const authController = new AuthController();
