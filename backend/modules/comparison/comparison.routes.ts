import { Router } from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = Router();

// Path to the comparison engine scripts (relative to backend/modules/comparison/comparison.routes.ts)
const COMPARE_ENGINE_DIR = path.resolve(__dirname, '../../../real_compare/real_compare');

/**
 * @route GET /api/comparison/inter/:productId
 * @desc Run inter-site comparison for a given product ID
 */
router.get('/inter/:productId', (req, res) => {
  const { productId } = req.params;
  
  // Use the new JSON output mode
  const command = `node planpro_engine.js --json-output --id "${productId}"`;
  
  exec(command, { cwd: COMPARE_ENGINE_DIR, env: { ...process.env, NODE_ENV: 'production' } }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing inter comparison: ${error}`);
      return res.status(500).json({ error: 'Failed to run comparison engine', details: stderr });
    }
    
    res.json({ 
      productId,
      rawOutput: stdout,
      type: 'inter-site'
    });
  });
});

/**
 * @route POST /api/comparison/intra
 * @desc Run intra-site comparison for a wishlist and query
 */
router.post('/intra', (req, res) => {
  const { wishlistIds, query } = req.body;
  
  if (!wishlistIds || !query) {
    return res.status(400).json({ error: 'wishlistIds and query are required' });
  }
  
  const wishlistStr = wishlistIds.join(',');
  
  // Use argparse flags instead of stdin piping (much more reliable on Windows)
  // Escape the query for the shell by wrapping in double quotes and escaping special chars
  const escapedQuery = query.replace(/"/g, '\\"');
  const command = `python intra_RC.py --ids "${wishlistStr}" --query "${escapedQuery}"`;
  
  exec(command, { 
    cwd: COMPARE_ENGINE_DIR, 
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    timeout: 30000
  }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing intra comparison: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Failed to run intra-site engine', details: stderr });
    }
    
    res.json({ 
      query,
      rawOutput: stdout,
      type: 'intra-site'
    });
  });
});

export default router;
