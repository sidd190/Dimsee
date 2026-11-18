const mongoose = require('mongoose');

const OrganizationMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'admin', 'owner'],
    default: 'member',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [OrganizationMemberSchema]
}, { timestamps: true });

// Note: slug index is uniquely created by { unique: true } on field definition
OrganizationSchema.index({ 'members.userId': 1 });

module.exports = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
