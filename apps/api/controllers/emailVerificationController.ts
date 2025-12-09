import { Request, Response } from 'express';
import { prisma } from '../api';
import { sendEmailVerificationEmail } from '../utils/email';
import {
  signVerificationToken,
  verifyVerificationToken,
} from '../utils/emailVerification';
import { AuthenticatedRequest } from '../utils/express';

export async function requestEmailVerification(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email matches user's email
    if (user.email.toLowerCase() !== email.toLowerCase().trim()) {
      return res
        .status(400)
        .json({ error: 'Email does not match your account' });
    }

    // Check if already verified
    if (user.emailVerification) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const token = signVerificationToken(user.id, user.email);

    try {
      await sendEmailVerificationEmail({
        to: user.email,
        email: user.email,
        token,
      });
      res.json({ success: true, message: 'Verification email sent' });
    } catch (emailError) {
      console.error('[email-verification] send failed', emailError);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('[email-verification] request failed', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { token, email } = req.query;

  if (
    !token ||
    !email ||
    typeof token !== 'string' ||
    typeof email !== 'string'
  ) {
    return res.status(400).json({ error: 'Token and email are required' });
  }

  try {
    const payload = verifyVerificationToken(token, email);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: 'Email mismatch' });
    }

    // Update email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerification: true },
    });

    // Return success page or redirect
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      redirect: 'bomber://home', // Deep link back to app
    });
  } catch (error: any) {
    console.error('[email-verification] verify failed', error);
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired verification token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
