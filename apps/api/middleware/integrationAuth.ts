import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authenticate integration requests using API key
 * Expects the API key in the Authorization header as "Bearer <API_KEY>"
 */
export function integrationAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      error: 'Missing authorization header',
    });
  }

  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Invalid authorization format. Expected: Bearer <API_KEY>',
    });
  }

  const providedApiKey = parts[1];
  const expectedApiKey = process.env.INTEGRATION_API_KEY;

  if (!expectedApiKey) {
    console.error('INTEGRATION_API_KEY is not set in environment variables');
    return res.status(500).json({
      error: 'Integration authentication not configured',
    });
  }

  if (providedApiKey !== expectedApiKey) {
    return res.status(403).json({
      error: 'Invalid API key',
    });
  }

  // Authentication successful
  next();
}
