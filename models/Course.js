const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  slug:       { type: String, required: true, unique: true, lowercase: true },
  description:{ type: String },
  thumbnail:  { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
