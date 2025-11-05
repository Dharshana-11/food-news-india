import User from "../models/User.js";
import ROLES from "../utils/constants/roles.js";
import admin from "../firebase.js";

//Create new user
export const createUser = async (req, res)=>{
  try{
    const role=req.body.role;

    //Create user in Firebase
    let firebaseUser;
    if (role===ROLES.ADMIN || role===ROLES.SUPER_ADMIN){
      firebaseUser=await admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.name,
      });
    }
    if (role!==ROLES.ADMIN && role!==ROLES.SUPER_ADMIN){
      firebaseUser=await admin.auth().createUser({
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
  } catch (err){
    res.status(400).json({error:err.message});
  }
};

//Get all users (with filtering & sorting)
export const getAllUsers = async (req,res)=>{
  try{
    const {
      role,
      isVerified,
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
    if (isVerified !== undefined){
      filters.isVerified=isVerified;
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

    console.log("users",users)

    return res.status(200).json({
      total: totalUsers,
      page: parseInt(page),
      limit: parseInt(limit),
      users});
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
};

//Update user details
export const updateUserById = async (req,res)=>{
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

//Verify user
export const verifyUser = async (req,res)=>{
  try{
    const uid=req.userData.uid;

    //Update user in db
    const updatedUser = await User.findOneAndUpdate(
        { uid },
        { $set: { isVerified: true }},
        { new: true } // returns updated document
      );

    return res.status(200).json({ message: "User verified successfully", user: updatedUser });
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
};

//Reject user
export const rejectUser = async (req,res)=>{
  try{
    const uid=req.userData.uid;

    //Update user in db
    const updatedUser = await User.findOneAndUpdate(
        { uid },
        { $set: { isVerified: false }},
        { new: true } // returns updated document
      );

    return res.status(200).json({ message: "User rejected successfully", user: updatedUser });
  }catch(err){
    return res.status(500).json({ error: err.message });
  }
};