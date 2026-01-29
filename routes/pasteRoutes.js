import express from 'express';
import Paste from '../models/Paste.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST /api/pastes - Create a new paste
router.post('/api/pastes', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Invalid content' });
    }

    if (ttl_seconds && ttl_seconds < 1) {
      return res.status(400).json({ error: 'Invalid expiry' });
    }

    if (max_views && max_views < 1) {
      return res.status(400).json({ error: 'Invalid max views' });
    }

    let expiresAt = null;
    if (ttl_seconds) expiresAt = new Date(Date.now() + ttl_seconds * 1000);

    const paste = await Paste.create({
      content,
      expiresAt,
      maxViews: max_views ?? null,
      views: 0
    });

    res.status(201).json({
      id: paste._id.toString(),
      url: `${req.protocol}://${req.get('host')}/p/${paste._id}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /p/:id - View a paste
router.get('/p/:id', async (req, res) => {
  try {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send('Paste not found');
    }

    const paste = await Paste.findById(id);
    if (!paste) return res.status(404).send('Paste not found');

    const now = Date.now();

    // Check expiration
    if (paste.expiresAt && now > paste.expiresAt.getTime()) {
      return res.status(404).send('Paste expired');
    }

    // Check max views
    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.status(404).send('Paste view limit exceeded');
    }

    paste.views += 1;
    await paste.save();

    // Serve HTML with injected content
    const filePath = path.join(__dirname, '../public/paste.html');
    let html = fs.readFileSync(filePath, 'utf-8');
    html = html.replace(
      '</head>',
      `<script>window.PASTE_CONTENT = ${JSON.stringify(paste.content)};</script></head>`
    );

    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
