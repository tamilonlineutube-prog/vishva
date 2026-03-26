const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    businessAccountId: {
      type: String,
      required: true,
    },
    whatsappAccessToken: {
      type: String,
      required: true,
    },
    phoneNumberId: {
      type: String,
      required: true,
    },
    displayPhoneNumber: {
      type: String,
      required: true,
    },
    businessPhoneNumberId: {
      type: String,
      sparse: true,
    },
    verifiedName: {
      type: String,
      sparse: true,
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PENDING', 'FAILED', 'REJECTED'],
      default: 'PENDING',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastVerificationCheck: {
      type: Date,
      default: null,
    },
    verificationError: {
      type: String,
      default: null,
    },
    metaError: {
      type: String,
      default: null,
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

// Encrypt sensitive data before saving (optional - implement encryption)
accountSchema.pre('save', async function (next) {
  // TODO: Implement encryption for whatsappAccessToken
  // For now, storing as-is but should be encrypted in production
  next();
});

module.exports = mongoose.model('Account', accountSchema);
