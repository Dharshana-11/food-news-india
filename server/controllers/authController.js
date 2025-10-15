/**
 * @route   GET /api/auth/verify
 * @desc    Verify Firebase token and return authenticated user info
 * @access  Private (requires valid Firebase ID token)
 */
export const verifyUser = (req, res) => {
  // `req.user` is populated by authenticateUser middleware
  // Returning authenticated user info
  return res.status(200).json({
    success: true,
    message: "User verified successfully",
    user: req.user,
  });
};
