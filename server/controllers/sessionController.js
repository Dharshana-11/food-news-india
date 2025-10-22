import Users from '../models/Users.js';
import UserSession from '../models/UserSession.js';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {
    try{
         // authenticateUser middleware verifies the user & returns the uid along with user information.
        const {uid} = req.user;
        console.log("Successfully verified ID token for user:",uid)

        const user = await Users.findOne({uid}); //Check is the uid exists in Users collection
        if(user){ //If user exists
            const now = new Date();
            await UserSession.updateMany({uid, is_active: true, expiresAt: { $gt: now }}, {is_active: false, logout_time: now}); //Close all other active sessions

            const sessionTTL = parseInt(process.env.SESSION_TTL_HOURS || "1", 10)
            const expiresAt = new Date(Date.now() + sessionTTL * 60 * 60 * 1000);
 
            const newSession = await UserSession.create({
                uid, 
                login_time: now, 
                is_active: true, 
                sessionToken: uuidv4(), 
                expiresAt})

            res.json({message: "Session created successfully", sessionToken: newSession.sessionToken, user})
        }else{
            res.status(404).json({ message: "User not found" });
        }
    }catch(error){
        console.log("Error verifying ID token", error);
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ message: "Invalid or expired Firebase token" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutSession = async (req, res) => {
    try{
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Authorization header missing" });
    }
        //Extract session token
        const sessionToken = req.headers.authorization?.split(" ")[1] 

        if (!sessionToken) {
             return res.status(400).json({ message: "Session token required" }); 
            }

        //Check is session token exists in UserSession collection
        const session = await UserSession.findOne({sessionToken, is_active: true, expiresAt: { $gt: new Date() } }); 
        if(!session){
            return res.status(404).json({ message: "Active session not found or already logged out"});
        }

        //Update document to record logut time and set is_active to false
        session.is_active = false;
        session.logout_time = new Date();
        session.expiresAt = null;
        await session.save();

        return res.json({message: "Logged out successfully"});
    }catch(error){
        console.log("Logout error", error);
        res.status(500).json({ message: "Internal server error" });
    }
};