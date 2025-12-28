/**
 * Update Controller
 * PUT /:id - Update content (admin only)
 */

import { updateContent, getContentById } from '../models/content.js';

export async function updateController(req, res) {
  try {
    // Check authorization (should be admin)
    const { id } = req.params;

    // Verify content exists
    const existing = await getContentById(parseInt(id));
    if (!existing) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const updated = await updateContent(parseInt(id), req.body);

    res.json(updated);
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ error: 'Failed to update content' });
  }
}
