const express = require('express');
const router = express.Router();

const {
  registerAdmin,
  approveAdmin,
  loginAdmin,
  getAdminStatus,
  getAllAdmins,
  requestPasswordReset,
  resetPasswordWithToken,
  getProfile,
  uploadProfilePic,    // ✅ correct function name
  uploadMiddleware     // ✅ multer middleware
} = require('../controllers/adminController');

// ─── Auth and Admin Management ────────────────
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.put('/approve/:loginID', approveAdmin);
router.get('/status/:loginID', getAdminStatus);
router.get('/all', getAllAdmins);

// ─── Password Reset ───────────────────────────
router.post('/requestReset', requestPasswordReset);
router.put('/resetPassword/:token', resetPasswordWithToken);

// ─── Profile Management ───────────────────────
router.get('/me', getProfile);
router.post('/uploadAvatar', uploadMiddleware, uploadProfilePic); // ✅ renamed route handler

module.exports = router;
