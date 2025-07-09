// controllers/adminController.js

const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');

// ─── Multer Setup for Profile Upload ──────────────────────────────────────────
const storage = multer.memoryStorage();
exports.uploadMiddleware = multer({ storage }).single('avatar');

// ─── Nodemailer Transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── Utility: Generate LoginID ────────────────────────────────────────────────
const generateLoginID = (role) => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return role.toUpperCase() + random;
};

// ─── Register Admin ───────────────────────────────────────────────────────────
exports.registerAdmin = async (req, res) => {
  const { emailID, password, exam, course, role, fullName } = req.body;

  try {
    const loginID = generateLoginID(role);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      loginID,
      emailID,
      password: hashedPassword,
      exam,
      course,
      role,
      fullName,
      approvalStatus: 'Not Approved'
    });
    await newAdmin.save();

    const statusLink = `http://localhost:3000/status.html?loginID=${loginID}`;

    await transporter.sendMail({
      from: `"NPI Team" <${process.env.EMAIL_USER}>`,
      to: emailID,
      subject: "Welcome to NPI Admin Portal",
      html: `
        <h3>Welcome ${fullName}</h3>
        <p>Your LoginID: <strong>${loginID}</strong></p>
        <p>Check status: <a href="${statusLink}">View Status</a></p>
      `
    });

    res.json({ message: "Registered successfully, email sent", loginID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// ─── Login Admin ──────────────────────────────────────────────────────────────
exports.loginAdmin = async (req, res) => {
  const { loginID, password } = req.body;

  try {
    const admin = await Admin.findOne({ loginID });
    if (!admin) return res.status(404).json({ error: 'LoginID not found' });

    if (admin.approvalStatus !== 'Approved') {
      return res.status(403).json({ error: 'Account not yet approved' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign(
      { loginID: admin.loginID, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login successful', token, role: admin.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Approve Admin ────────────────────────────────────────────────────────────
exports.approveAdmin = async (req, res) => {
  const { loginID } = req.params;

  try {
    const admin = await Admin.findOne({ loginID });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    admin.approvalStatus = 'Approved';
    await admin.save();

    await transporter.sendMail({
      from: `"NPI Team" <${process.env.EMAIL_USER}>`,
      to: admin.emailID,
      subject: "Approval Confirmation",
      html: `
        <h3>Congratulations ${admin.fullName}</h3>
        <p>Your admin account is approved as <strong>${admin.role}</strong>.</p>
        <p>LoginID: ${admin.loginID}</p>
      `
    });

    res.json({ message: "Admin approved and email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Approval failed" });
  }
};

// ─── Get Admin Status ─────────────────────────────────────────────────────────
exports.getAdminStatus = async (req, res) => {
  const { loginID } = req.params;

  try {
    const admin = await Admin.findOne({ loginID });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    res.json({
      fullName: admin.fullName,
      loginID: admin.loginID,
      approvalStatus: admin.approvalStatus,
      role: admin.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

// ─── Get All Admins ───────────────────────────────────────────────────────────
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

// ─── Request Password Reset ───────────────────────────────────────────────────
exports.requestPasswordReset = async (req, res) => {
  const { emailID } = req.body;

  try {
    const admin = await Admin.findOne({ emailID });
    if (!admin) return res.status(404).json({ error: 'Email not found' });

    const resetToken = jwt.sign(
      { loginID: admin.loginID },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:3000/resetPassword.html?token=${resetToken}`;

    await transporter.sendMail({
      from: `"NPI Team" <${process.env.EMAIL_USER}>`,
      to: emailID,
      subject: "Reset your NPI Admin Portal password",
      html: `
        <h3>Hello ${admin.fullName}</h3>
        <p>Reset your password: <a href="${resetLink}">Reset Password</a></p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
};

// ─── Reset Password With Token ────────────────────────────────────────────────
exports.resetPasswordWithToken = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ loginID: decoded.loginID });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ loginID: decoded.loginID });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json({
      fullName: admin.fullName,
      emailID: admin.emailID,
      loginID: admin.loginID,
      profilePic: admin.profilePic ? 
        `data:${admin.profilePic.contentType};base64,${admin.profilePic.data.toString('base64')}`
        : null
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// ─── Upload Profile Pic ───────────────────────────────────────────────────────
exports.uploadProfilePic = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ loginID: decoded.loginID });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    admin.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await admin.save();

    res.json({ message: "Profile picture updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ─── Seed Owner ───────────────────────────────────────────────────────────────
exports.seedOwner = async () => {
  const owner = await Admin.findOne({ loginID: "OWNERNPI2025" });
  if (!owner) {
    const hashedPassword = await bcrypt.hash("Piyush@NPI2025", 10);
    const newOwner = new Admin({
      loginID: "OWNERNPI2025",
      emailID: "nfatnpi@gmail.com",
      password: hashedPassword,
      exam: "NFAT",
      course: "All",
      role: "Owner",
      approvalStatus: "Approved",
      fullName: "Piyush"
    });
    await newOwner.save();
    console.log("Owner seeded successfully");
  }
};
