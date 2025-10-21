import admin from 'firebase-admin';
import Users from '../models/Users.js';
import UserSession from '../models/UserSession.js';
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {
    try{
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Authorization header missing" });
        }
        const token = req.headers.authorization?.split(" ")[1]; //extracting uid from request authorization header

        const decodedToken = await admin.auth().verifyIdToken(token); // Firebase admin authenticates the user & returns the uid, email/phone
        const uid = decodedToken.uid; //Extracting uid from decodedToken
        console.log("Successfully verified ID token for user:",uid)

        const user = await Users.findOne({uid}); //Check is the uid exists in Users collection
        if(user){ //If user exists
            await UserSession.updateMany({uid, is_active: true}, {is_active: false, logout_time: new Date()}); //Close all other active sessions
            const newSession = await UserSession.create({uid, login_time: new Date(), is_active: true, sessionToken: uuidv4()})

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
        const session = await UserSession.findOne({sessionToken, is_active: true}); 
        if(!session){
            return res.status(404).json({ message: "Active session not found or already logged out"});
        }

        //Update document to record logut time and set is_active to false
        session.is_active = false;
        session.logout_time = new Date();
        await session.save();

        return res.json({message: "Logged out successfully"});
    }catch(error){
        console.log("Logout error", error);
        res.status(500).json({ message: "Internal server error" });
    }
};