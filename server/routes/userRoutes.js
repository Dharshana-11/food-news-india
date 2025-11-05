import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import ROLES from "../utils/constants/roles.js";
import { createUser, getAllUsers, updateUserById,verifyUser,rejectUser} from "../controllers/userController.js";
import validateRole from "../middleware/validateRole.js";
import checkDuplicateUser from "../middleware/checkDuplicateUser.js";
import checkDuplicateForUpdate from "../middleware/checkDuplicateForUpdate.js";
import checkUserExists from "../middleware/checkUserExists.js";
import User from "../models/User.js";

const router = express.Router();

//Self user routes
router.get(
  "/me", 
  authenticateUser, 
  async (req, res) => {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  }
);

router.put("/me", 
  authenticateUser,
  checkDuplicateForUpdate, 
  async (req, res) => {
    const updateData = { ...req.body };
    //Prevent role, isVerified, uid change
    // delete updateData.role;
    // delete updateData.isVerified;
    // delete updateData.uid;
    const user = await User.findOneAndUpdate(
    { uid: req.user.uid },
    { $set: updateData },
    { new: true }
  );
  res.status(200).json(user);
});

router.delete("/me", 
  authenticateUser, 
  async (req, res) => {
    await User.findOneAndDelete({ uid: req.user.uid });
    res.status(200).json({ message: "Account deleted successfully" });
});

//Common User Routes

router.post(
  "/",
  authenticateUser, 
  authorizeRoles(ROLES.SUPER_ADMIN), 
  validateRole,
  checkDuplicateUser,
  createUser
);

router.get(
  "/",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getAllUsers
);

router.get(
  "/:uid",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  checkUserExists,
  async (req,res)=>{
    return res.status(200).json(req.userData); // req.userData already contains the user document
  }
);

router.put(
  "/:uid",
  authenticateUser,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  checkUserExists,
  checkDuplicateForUpdate,
  updateUserById
);

router.patch(
  "/:uid/verify",
  authenticateUser,
  authorizeRoles(ROLES.SUPER_ADMIN),
  checkUserExists,
  checkDuplicateForUpdate,
  checkDuplicateUser,
  verifyUser
);

router.patch(
  "/:uid/reject",
  authenticateUser,
  authorizeRoles(ROLES.SUPER_ADMIN),
  checkUserExists,
  checkDuplicateForUpdate,
  checkDuplicateUser,
  rejectUser
);

router.delete(
  "/:uid",
  authenticateUser,
  authorizeRoles(ROLES.SUPER_ADMIN),
  checkUserExists,
  async (req,res)=>{
    await req.userData.deleteOne();
    return res.status(200).json({ message: "User deleted successfully" });
  }
);

export default router;