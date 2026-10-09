import { Router } from 'express';
import protect from '../middleware/auth.js';
import SavedSearch from '../models/SavedSearch.js';

const router = Router();
router.use(protect);
const pick = (b) => Object.fromEntries(['q', 'location', 'field', 'sector', 'remote', 'level'].map((k) => [k, String(b?.[k] || '').trim().slice(0, 100)]));

router.get('/', async (req, res, next) => { try { res.json({ searches: await SavedSearch.find({ user: req.user._id }).sort('-createdAt') }); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => {
  try {
    const f = pick(req.body);
    if (!f.q && !f.field && !f.location) return res.status(400).json({ message: 'Type a keyword, location or choose a field first.' });
    const name = String(req.body.name || '').trim() || [f.q, f.field, f.location].filter(Boolean).join(' · ');
    res.status(201).json({ search: await SavedSearch.create({ user: req.user._id, name, ...f }) });
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => { try { await SavedSearch.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: 'Deleted' }); } catch (e) { next(e); } });
export default router;
