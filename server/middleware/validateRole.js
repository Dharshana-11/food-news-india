import ROLES from "../utils/constants/roles.js";

/**
 * Middleware to validate user role and required contact fields during creation or update.
 *
 * 🔐 Validation Rules:
 * - `role` is mandatory for every user.
 * - If role is **Admin or Super Admin**, `email` is required.
 * - If role is **not** Admin or Super Admin, `phone` is required.
 *
 * 📌 Assumes `ROLES` contains:
 * - `ADMIN`
 * - `SUPER_ADMIN`
 * - Any other roles (agent, business_owner, etc.)
 *
 * 🛑 Responds with:
 * - `400 Bad Request` if a mandatory field is missing.
 * - `500 Internal Server Error` for unexpected errors.
 *
 * @function validateRole
 * @param {import("express").Request} req - Express request object containing user data in `req.body`.
 * @param {import("express").Response} res - Express response object for sending validation errors.
 * @param {import("express").NextFunction} next - Callback to pass control to the next middleware if valid.
 * @returns {void}
 *
 * @example
 * router.post("/users", validateRole, createUser);
 * router.put("/users/:uid", validateRole, updateUser);
 */
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
