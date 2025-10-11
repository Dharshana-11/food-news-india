// const admin = require('../firebase'); // firebase admin instance
// const AdminModel = require('../models/Admin'); // Mongoose model for Admin

import admin from '../firebase.js';
import AdminModel from '../models/Admin.js';

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Extract UID from token
    const { uid, email } = decodedToken;

    // Check if UID exists in Admin collection
    const user = await AdminModel.findOne({ uid });
    if (!user) {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Attach user info to req for next middlewares
    req.user = {
      uid: user.uid,
      role: user.role,
      name: user.name,
      email: email,
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateUser;
