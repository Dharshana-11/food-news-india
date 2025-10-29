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

            const refreshExpiresAt = new Date(Date.now() + 24 * 7 * 60 * 60 * 1000);
 
            const newSession = await UserSession.create({
                uid, 
                login_time: now, 
                is_active: true, 
                sessionToken: uuidv4(), 
                expiresAt,
                refreshToken: uuidv4(),
                refreshExpiresAt
            })

            res.cookie("sessionToken", newSession.sessionToken,{
                httpOnly: true,
                secure:  process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: sessionTTL * 60 * 60 * 1000,
                expires: expiresAt
            })

            res.cookie("refreshToken", newSession.refreshToken,{
                httpOnly: true,
                secure:  process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 24 * 7 * 60 * 60 * 1000,
                expires: refreshExpiresAt
            })

            res.json({message: "Session created successfully", user})
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
        //Extract session token
        const sessionToken = req.cookies.sessionToken;

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
        await session.save();

        res.clearCookie("sessionToken");

        return res.json({message: "Logged out successfully"});
    }catch(error){
        console.log("Logout error", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const refreshSession = async(req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token required" });
        }

        //atomic update to prevent race condition
        const session = await UserSession.findOneAndUpdate(
            { refreshToken: refreshToken, is_active: true, rotated: false, refreshExpiresAt: { $gt: new Date() } },
            { $set: { rotated: true, is_active: false, logout_time: new Date() } },
            { new: true }
        );
        //update log out time for old session (for logging)
        console.log("Cookies received at refresh:", req.cookies);
        console.log("Found session:", session);

        if(!session){
            const expiredSession = await UserSession.findOne({refreshToken: refreshToken});
            if(expiredSession){
                expiredSession.is_active = false;
                expiredSession.logout_time = new Date();
                await expiredSession.save();
            }
            return res.status(401).json({message: "Active session not found or already logged out"})
        }

        const newSessionToken = uuidv4();
        const newRefreshToken = uuidv4();
        const sessionTTL = parseInt(process.env.SESSION_TTL_HOURS || "1", 10);
        const refreshTTL = parseInt(process.env.REFRESH_TTL_DAYS || "7", 10);
        const expiresAt = new Date(Date.now() + sessionTTL * 60 * 60 * 1000);
        const refreshExpiresAt = new Date(Date.now() + (refreshTTL * 24 * 60 * 60 * 1000));

        await UserSession.create({
            uid: session.uid,
            login_time: new Date(),
            logout_time: null,
            is_active: true,
            sessionToken: newSessionToken,
            expiresAt: expiresAt,
            refreshToken: newRefreshToken,
            refreshExpiresAt: refreshExpiresAt,
            rotated: false
        })

        res.cookie("sessionToken", newSessionToken,{
                    httpOnly: true,
                    secure:  process.env.NODE_ENV === "production",
                    sameSite: "Strict",
                    maxAge: sessionTTL * 60 * 60 * 1000,
                    expires: expiresAt
                });
        
        res.cookie("refreshToken", newRefreshToken,{
                    httpOnly: true,
                    secure:  process.env.NODE_ENV === "production",
                    sameSite: "Strict",
                    maxAge: refreshTTL * 24 * 60 * 60 * 1000,
                    expires: refreshExpiresAt
                });
        
        return res.json({message: "Session refreshed successfully"});

    }catch(error){
        console.error("Error refreshing session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}