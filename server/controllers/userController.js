import User from "../models/User.js";
import ROLES from "../utils/constants/roles.js";
import firebaseAdmin from "../firebase/firebase.js";  
import sendNotificationUtil from "../utils/sendNotification.js";

/**
 * @file User Controller
 * @description Handles user-related operations including creation, retrieval, updates, and verification
 * @module controllers/userController
 */

/**
 * Creates a new user in both Firebase and MongoDB
 * @route POST /api/users
 * @access Private (Admin/SuperAdmin only)
 * @param {Object} req - Express request object
 * @param {Object} req.body - User data
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email (required for admin/superadmin)
 * @param {string} req.body.phone - User's phone number (required for non-admin roles)
 * @param {string} req.body.password - User's password (required for admin/superadmin)
 * @param {string} req.body.role - User's role (must be one of: user, admin, super_admin)
 * @param {boolean} [req.body.isVerified] - Whether the user is verified
 * @param {Object} res - Express response object
 * @returns {Object} The created user object
 * @throws {400} If required fields are missing or invalid
 * @throws {500} If there's an error creating the user
 * @example
 * // Request body example for admin
 * {
 *   "name": "John Doe",
 *   "email": "admin@example.com",
 *   "password": "securePassword123",
 *   "role": "admin",
 *   "isVerified": true
 * }
 */
export const createUser = async (req, res)=>{
  try{
    const role=req.body.role;

    //Create user in Firebase
    let firebaseUser;
    if (role===ROLES.ADMIN || role===ROLES.SUPER_ADMIN){
      firebaseUser=await firebaseAdmin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.name,
      });
    }
    if (role!==ROLES.ADMIN && role!==ROLES.SUPER_ADMIN){
      firebaseUser=await firebaseAdmin.auth().createUser({
        phoneNumber: req.body.phone,
        displayName: req.body.name,
      });
    }

    //Save user in MongoDB with firebase uid
    const newUser=new User({
      uid: firebaseUser.uid,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      isVerified: req.body.isVerified || false,
    });
    const savedUser=await newUser.save(newUser); 
    //await is used because .save() returns a promise
    //savedUser - contains saved document

    res.status(201).json({"User created":savedUser});

    await sendNotificationUtil({
      event: "user_created",
      payload: {
        name: savedUser.name,
        role: savedUser.role,
        email: savedUser.email,
        phone: savedUser.phone
      },
      target: {
        roles: ["admin", "super_admin"]  // notify admins
      }
    });
  } catch (err){
    res.status(400).json({error:err.message});
  }
};

/**
 * Retrieves all users with optional filtering and sorting
 * @route GET /api/users
 * @access Private (Admin/SuperAdmin only)
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.role] - Filter by user role
 * @param {boolean} [req.query.isVerified] - Filter by verification status
 * @param {string} [req.query.search] - Search term to filter users by name or email
 * @param {string} [req.query.sortBy] - Field to sort by (e.g., 'createdAt', 'name')
 * @param {string} [req.query.order] - Sort order ('asc' or 'desc')
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of users per page
 * @param {Object} res - Express response object
 * @returns {Object} Paginated list of users
 */
export const getAllUsers = async (req,res)=>{
  try{
    const {
      role,
      status,
      name,
      email,
      phone,
      sortBy = "createdAt",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    // Building filters dynamically
    const filters={};

    // always exclude deleted accounts
    filters.isDeleted = false;

    //Role-based filtering
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
      // Admin can filter by any role
      if (role && Object.values(ROLES).includes(role)) {
        filters.role = role;
      }
    } else if(req.user.role===ROLES.BUSINESS_OWNER){
      //Default filter restriction for business owner (applied when user does not provide a query param)
      filters.role={$in:[ROLES.AGENT,ROLES.SERVICE_PROVIDER]}
      if ((role) && [ROLES.AGENT,ROLES.SERVICE_PROVIDER].includes(role)){
        filters.role = role
      }
    } else if (req.user.role === ROLES.AGENT) {
      // AGENT can see only service providers
      filters.role = ROLES.SERVICE_PROVIDER;
      if (role && role === ROLES.SERVICE_PROVIDER) filters.role = role;
    } else if (req.user.role === ROLES.SERVICE_PROVIDER) {
      // SERVICE_PROVIDER can see only agents
      filters.role = ROLES.AGENT;
      if (role && role === ROLES.AGENT) filters.role = role;
    } else {
      // Normal user sees only themselves
      filters.uid = req.user.uid;
    }

    if ((role) && (Object.values(ROLES).includes(role))){
      filters.role=role;
    }

    if (status && ["pending", "verified", "invalid"].includes(status)) {
      filters.status = status;
    }

    if (name) {
      filters.name = { $regex: name, $options: "i" }; // $regex allows partial and case-insensitive search
    }
    if (email) {
      filters.email = { $regex: email, $options: "i" };
    }
    if (phone) {
      filters.phone = phone;
    }

    //Building sort dynamically
    const sort={}; //sort object where key = field name and value = 1 (ascending) or -1 (descending)
    const sortOrder= (order === "desc" ? -1 : 1);
    sort[sortBy]=sortOrder;

    // Pagination calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Total count for pagination
    const totalUsers = await User.countDocuments(filters);  //total users matching the filters

    //Fetch Users
    const users=await User.find(filters).sort(sort).skip(skip).limit(parseInt(limit));

    return res.status(200).json({
      total: totalUsers,
      page: parseInt(page),
      limit: parseInt(limit),
      users});
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Updates a user's details by ID
 * @route PUT /api/users/:id
 * @access Private (Admin/SuperAdmin or the user themselves)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to update
 * @param {Object} req.body - Fields to update
 * @param {string} [req.body.name] - Updated name
 * @param {string} [req.body.email] - Updated email
 * @param {string} [req.body.phone] - Updated phone number
 * @param {string} [req.body.role] - Updated role (Admin/SuperAdmin only)
 * @param {boolean} [req.body.isVerified] - Verification status (Admin/SuperAdmin only)
 * @param {Object} res - Express response object
 * @returns {Object} Updated user object
 * @throws {404} If user is not found
 * @throws {403} If user doesn't have permission to update
 */
export const updateUserById = async (req, res) => {
  try{
    const currentUserUid=req.userData.uid;
    const { name, email, phone }=req.body;

    // Building update object dynamically
    let updateData={};

    if(name) updateData.name=name;
    if(email) updateData.email=email;
    if(phone) updateData.phone=phone;

    //Update user in db
    const updatedUser = await User.findOneAndUpdate(
        { uid : currentUserUid},
        { $set: updateData },
        { new: true } // returns updated document
      );

    return res.status(200).json({ message: "User updated", user: updatedUser });
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Verifies a user account
 * @route PATCH /api/users/:id/verify
 * @access Private (Admin/SuperAdmin only)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to verify
 * @param {Object} res - Express response object
 * @returns {Object} Success message and updated user
 * @throws {404} If user is not found
 * @throws {400} If user is already verified
 */
export const verifyUser = async (req, res) => {
  try {
    const uid = req.userData.uid;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update DB
    user.isVerified = true;
    user.status = "verified";
    user.rejectionReason = undefined; // clear previous rejection reason if any
    await user.save();

    // Enable login in Firebase Auth
    await firebaseAdmin.auth().updateUser(uid, { disabled: false });

    // Respond to client immediately
    res.status(200).json({ message: "User verified successfully", user });

    // Send notification in background
    sendNotificationUtil({
      event: "user_verified",
      payload: {
        name: user.name
      },
      target: {
        uid: user.uid
      }
    }).catch(console.error);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * Rejects a user's account (marks as unverified)
 * @route PATCH /api/users/:id/reject
 * @access Private (Admin/SuperAdmin only)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to reject
 * @param {string} [req.body.reason] - Reason for rejection
 * @param {Object} res - Express response object
 * @returns {Object} Success message and updated user
 * @throws {404} If user is not found
 * @throws {400} If user is already rejected
 */
export const rejectUser = async (req, res) => {
  try {
    const uid = req.userData.uid;
    const { reason } = req.body; // optional rejection reason

    // Find user
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update DB
    user.isVerified = false;
    user.status = "invalid";
    if (reason) user.rejectionReason = reason; // storing rejection reason
    await user.save();

    // Disable login in Firebase Auth
    await firebaseAdmin.auth().updateUser(uid, { disabled: true });

    // Respond to client immediately
    res.status(200).json({ message: "User rejected successfully", user });

    // Send notification in background
    sendNotificationUtil({
      event: "user_rejected",
      payload: {
        name: user.name,
        reason: user.rejectionReason
      },
      target: {
        uid: user.uid
      }
    }).catch(console.error);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};