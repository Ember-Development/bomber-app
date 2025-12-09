import { Request, Response } from 'express';
import { integrationService } from '../services/integrationService';

/**
 * Controller for handling integration-related requests
 */

export const getNilAthletes = async (req: Request, res: Response) => {
  try {
    const athletes = await integrationService.getNilAthletesForIntegration();

    return res.status(200).json({
      success: true,
      count: athletes.length,
      data: athletes,
    });
  } catch (error) {
    console.error('getNilAthletes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await integrationService.getAdminsForIntegration();

    return res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error('getAdmins error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
