import User from "../models/User.js";

// Middleware to check duplicates for update

/***
 * Checking whether email is already used by another user. 
 * Hence, excluding the current user from the check using $ne (not equal), 
 * because obviously their own value exists in the DB 
 */

const checkDuplicateForUpdate = async (req, res, next) => {
  try {
    const currentUserUid = req.user?.uid || req.userData?.uid; // req.userData.uid - current user from checkUserExists middleware & req.user.uid - For /me routes (self updates) 
    const { email, phone } = req.body;

    // Check email duplicate (excluding current user)
    if (email) {
      const existingEmail = await User.findOne({ email, uid: { $ne: currentUserUid } });
      if (existingEmail) {
        return res.status(409).json({ error: `User already exists with the email: ${email}` });
      }
    }

    // Check phone duplicate (excluding current user)
    if (phone) {
      const existingPhone = await User.findOne({ phone, uid: { $ne: currentUserUid } });
      if (existingPhone) {
        return res.status(409).json({ error: `User already exists with the phone number: ${phone}` });
      }
    }

    next(); // proceed to the update controller
  } catch (err) {
    console.error("Duplicate check error (update):", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default checkDuplicateForUpdate;
