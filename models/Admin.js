const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  loginID: { type: String, unique: true },
  emailID: { type: String, required: true },
  password: { type: String },
  exam: { type: String, enum: ['NFAT', 'RCET'], required: true },
  course: { type: String, required: true },
  role: { type: String, enum: ['Mentor', 'Test Manager', 'Blog Writer', 'Owner'], required: true },
  approvalStatus: { type: String, enum: ['Approved', 'Not Approved'], default: 'Not Approved' },
  fullName: { type: String, required: true },
profilePic: {
  data: Buffer,
  contentType: String
}
});

module.exports = mongoose.model('Admin', adminSchema);
