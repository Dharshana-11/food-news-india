import ROLES from "../utils/constants/roles.js";

const validateRole = (req, res, next) => {
  try {
    console.log("req body",req.body);
    const { role, email, phone } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    if ((role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) && !email) {
      return res.status(400).json({ error: "Admin and Super Admin must have email" });
    }

    if ((role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) && !phone) {
      return res.status(400).json({ error: "Non-admin users must have a phone number" });
    }

    next();
  } catch (err) {
    console.error("Role validation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default validateRole;
