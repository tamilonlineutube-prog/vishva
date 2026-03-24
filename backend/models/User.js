const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    whatsappNumber: {
      type: String,
      sparse: true,
    },
    supabaseId: {
      type: String,
      required: true,
      unique: true,
    },
    profile: {
      avatar: String,
      company: String,
      status: {
        type: String,
        enum: ['active', 'inactive', 'paused'],
        default: 'active',
      },
    },
    settings: {
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
