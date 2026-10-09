import { Router } from 'express';
import protect from '../middleware/auth.js';
import Application, { STATUSES } from '../models/Application.js';

// "Saved" is simply the first stage of the tracker: save a job -> later move it to applied / interview / offer.
const router = Router();
router.use(protect);
router.get('/', async (req, res, next) => {
  try { res.json({ applications: (await Application.find({ user: req.user._id }).populate('job').sort('-updatedAt')).filter((a) => a.job) }); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { job, status = 'saved' } = req.body;
    if (!job || !STATUSES.includes(status)) return res.status(400).json({ message: 'Valid job and status required' });
    const set = { status, ...(status === 'applied' && { appliedAt: new Date() }) };
    const a = await Application.findOneAndUpdate({ user: req.user._id, job }, { $set: set }, { new: true, upsert: true });
    res.status(201).json({ application: a });
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
    const set = { status: req.body.status, ...(req.body.notes !== undefined && { notes: req.body.notes }), ...(req.body.status === 'applied' && { appliedAt: new Date() }) };
    const a = await Application.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $set: set }, { new: true });
    a ? res.json({ application: a }) : res.status(404).json({ message: 'Not found' });
  } catch (e) { next(e); }
});
router.delete('/job/:jobId', async (req, res, next) => { try { await Application.deleteOne({ user: req.user._id, job: req.params.jobId }); res.json({ message: 'Removed' }); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { await Application.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: 'Deleted' }); } catch (e) { next(e); } });
export default router;
