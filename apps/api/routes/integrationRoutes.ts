import express from 'express';
import {
  getNilAthletes,
  getAdmins,
} from '../controllers/integrationController';
import { integrationAuth } from '../middleware/integrationAuth';

const router = express.Router();

/**
 * Integration routes for external systems
 * All routes require INTEGRATION_API_KEY authentication
 */

// GET /api/integrations/nil-athletes
// Returns all NIL athletes with their user, team, and parent information
router.get('/nil-athletes', integrationAuth, getNilAthletes);

// GET /api/integrations/admins
// Returns all admin users with their user information
router.get('/admins', integrationAuth, getAdmins);

export default router;
