import User from "../models/User.js";

/**
 * Middleware to verify that a user exists in the database using UID from route params.
 *
 * 🔍 Behavior:
 * - Reads `uid` from `req.params.uid`
 * - Searches for an existing user in MongoDB
 * - If no user is found → returns `404 Not Found`
 * - If found → attaches the user to `req.userData` for downstream handlers
 *
 * @async
 * @function checkUserExists
 * @param {import("express").Request} req - Express request object containing user UID in params.
 * @param {import("express").Response} res - Express response object used to send HTTP errors.
 * @param {import("express").NextFunction} next - Callback to pass control to the next middleware or route handler.
 * @returns {Promise<void>} Calls `next()` on success, or sends an HTTP error response.
 *
 * @example
 * // Use for routes where user must exist
 * router.get("/users/:uid", checkUserExists, getUserProfile);
 */
const checkUserExists = async (req,res,next)=>{
    try{
        const uid=req.params.uid;

        const user=await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ error: `User not found with UID: ${uid}` });
        }

        // Attach user to request object so next middleware/handler can use it
        req.userData = user;

        next();

    } catch (err){
        console.error("Error checking user existence:", err.message);
        return res.status(500).json({ error: "Server error while verifying user" });
    }
}

export default checkUserExists;
