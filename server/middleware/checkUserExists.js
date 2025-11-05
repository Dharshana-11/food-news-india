import User from "../models/User.js";

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