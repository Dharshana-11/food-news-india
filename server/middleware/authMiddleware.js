import admin from "../firebase.js"; // Firebase admin SDK instance
import AdminModel from "../models/Admin.js";

/**
 * Middleware to authenticate requests using Firebase ID token.
 * Checks if the token is valid and whether the user exists in Admin collection.
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    // Find admin user in database
    const user = await AdminModel.findOne({ uid });
    if (!user) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    // Attach user info to request object for downstream middlewares/controllers
    req.user = {
      uid: user.uid,
      role: user.role,
      name: user.name,
      identifier: user.email || user.phone, // identifier used for login
    };

    next(); // proceed to next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateUser;
