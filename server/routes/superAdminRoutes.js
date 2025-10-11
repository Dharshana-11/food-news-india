// routes/superAdminRoutes.js
import express from 'express';
import authenticateUser from '../middleware/authMiddleware.js';

const router = express.Router();

// Example super admin route
router.get('/dashboard', authenticateUser, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, Super Admin!` });
});

export default router;
