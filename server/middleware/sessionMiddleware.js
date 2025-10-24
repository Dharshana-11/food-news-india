import Users from "../models/Users.js";
import UserSession from "../models/UserSession.js";

export const verifySession = async (req, res, next) => {
    try{
        // Extract session token from cookie
        const sessionToken = req.cookies.sessionToken;

        if(!sessionToken){
            return res.status(400).json({message: "Session token required!"});
        }

        // Check if session is active
        const session = await UserSession.findOne({sessionToken, is_active: true});

        if(!session){
            return res.status(401).json({ message: "Session expired. Please refresh." });
        }

        if(new Date() > session.expiresAt){
            return res.status(401).json({message: "Session expired. Please login again"})
        }

        // Attach user info for downstream usage
        const user = await Users.findOne({ uid: session.uid }); // fetch from User model
        if (!user) return res.status(404).json({ message: "User not found" });
        req.user = user;
        next();

    }catch(error){
        console.log("Session verification error", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};