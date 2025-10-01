import express from 'express';

const router = express.Router();

// Minimal forums API to satisfy client expectations.
// Returns an array of forums with { id, title, description, postsCount }
router.get('/api/forums', async (req, res) => {
  try {
    // For now, return a safe empty array. In production this should query storage for forums.
    const sample = [
      { id: 1, title: 'General Discussion', description: 'General community conversation', postsCount: 42 },
      { id: 2, title: 'Bible Study', description: 'Discuss scripture and study resources', postsCount: 12 },
    ];

    res.json({ forums: sample });
  } catch (err) {
    console.error('Error in /api/forums', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
