const authorizeSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ message: 'Forbidden: Super Admins only' });
  }
  next();
};

module.exports = authorizeSuperAdmin;
