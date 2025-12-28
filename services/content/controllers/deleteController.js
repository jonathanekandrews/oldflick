/**
 * Delete Controller
 * DELETE /:id - Delete content (admin only)
 */

import { deleteContent, getContentById } from '../models/content.js';

export async function deleteController(req, res) {
  try {
    // Check authorization (should be admin)
    const { id } = req.params;

    // Verify content exists
    const existing = await getContentById(parseInt(id));
    if (!existing) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const deleted = await deleteContent(parseInt(id));

    if (deleted) {
      res.json({ message: 'Content deleted successfully', id: parseInt(id) });
    } else {
      res.status(500).json({ error: 'Failed to delete content' });
    }
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ error: 'Failed to delete content' });
  }
}
