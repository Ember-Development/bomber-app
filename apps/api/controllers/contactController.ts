import { Request, Response } from 'express';
import { sendContactEmail } from '../services/contact';

export async function submitContact(req: Request, res: Response) {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'subject', 'message'],
      });
    }

    // Send emails
    await sendContactEmail(data);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
