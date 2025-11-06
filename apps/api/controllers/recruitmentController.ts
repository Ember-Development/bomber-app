import { Request, Response } from 'express';
import { sendRecruitmentEmail } from '../services/recruitment';

export async function submitRecruitment(req: Request, res: Response) {
  try {
    const data = req.body;

    // Validate required fields
    if (
      !data.name ||
      !data.email ||
      !data.phone ||
      !data.city ||
      !data.state ||
      !data.role ||
      !data.type
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'phone', 'city', 'state', 'role', 'type'],
      });
    }

    // Validate type-specific fields
    if (data.type === 'team') {
      if (!data.teamName || !data.headCoach || !data.ageGroup) {
        return res.status(400).json({
          error: 'Missing required team fields',
          required: ['teamName', 'headCoach', 'ageGroup'],
        });
      }
    } else if (data.type === 'individual') {
      if (
        !data.yearsExperience ||
        !data.primaryPosition ||
        !data.playerAgeGroup
      ) {
        return res.status(400).json({
          error: 'Missing required individual fields',
          required: ['yearsExperience', 'primaryPosition', 'playerAgeGroup'],
        });
      }
    }

    // Send emails
    await sendRecruitmentEmail(data);

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting recruitment:', error);
    res.status(500).json({
      error: 'Failed to submit application',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
