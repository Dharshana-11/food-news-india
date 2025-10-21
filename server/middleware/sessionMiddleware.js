import UserSession from "../models/UserSession.js";

export const verifySession = async (req, res, next) => {
    try{
        if(!req.headers.authorization){
            return res.status(401).json({message: "Authorization header missing!"});
        }
        // Extract session token from Authorization Header
        const sessionToken = req.headers.authorization?.split(" ")[1];

        if(!sessionToken){
            return res.status(400).json({message: "Session token required!"});
        }

        // Check if session is active
        const session = await UserSession.findOne({sessionToken, is_active: true});

        if(!session){
            return res.status(401).json({message: "Unauthorized"});
        }

        // Attach session info for downstream usage
        req.session = session;
        next();


    }catch(error){
        console.log("Session verification error", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};