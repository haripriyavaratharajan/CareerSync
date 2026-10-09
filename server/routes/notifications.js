import { Router } from 'express';
import protect from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = Router();
router.use(protect);
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt');
    res.json({ notifications, unread: notifications.filter((n) => !n.read).length });
  } catch (e) { next(e); }
});
router.put('/read-all', async (req, res, next) => {
  try { await Notification.updateMany({ user: req.user._id }, { read: true }); res.json({ message: 'ok' }); } catch (e) { next(e); }
});
router.put('/:id/read', async (req, res, next) => {
  try { await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true }); res.json({ message: 'ok' }); } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { await Notification.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: 'Deleted' }); } catch (e) { next(e); }
});
export default router;
