import User from "../models/User.js";

const checkDuplicateUser = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    // Check email duplicate
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ error: `User already exists with the email: ${email}` });
      }
    }

    // Check phone duplicate
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ error: `User already exists with the phone number: ${phone}` });
      }
    }

    next();
  } catch (err) {
    console.error("Duplicate check error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default checkDuplicateUser;
