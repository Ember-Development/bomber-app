// routes/schoolRoutes.ts
import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Simple in-memory cache to avoid reading file every request
let schoolsCache: any = null;
let lastModified: number = 0;

/**
 * GET /api/schools
 * Returns the complete list of schools from schools.json
 * Uses in-memory caching for performance
 */
router.get('/', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/schools.json');
    const stats = await fs.stat(filePath);

    // Refresh cache if file was modified or cache is empty
    if (!schoolsCache || stats.mtimeMs > lastModified) {
      const data = await fs.readFile(filePath, 'utf-8');
      schoolsCache = JSON.parse(data);
      lastModified = stats.mtimeMs;
      console.log('Schools cache refreshed');
    }

    res.json(schoolsCache);
  } catch (error) {
    console.error('Error reading schools:', error);
    res.status(500).json({ error: 'Failed to load schools' });
  }
});

export default router;
