const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'],
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_INITIAL_REVIEW'],
      default: 'PENDING_REVIEW',
    },
    metaTemplateId: {
      type: String,
      unique: true,
      sparse: true, // Allow null for local-only templates
    },
    metaStatus: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_INITIAL_REVIEW', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    lastStatusCheck: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    submittedToMeta: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
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
  {
    timestamps: true,
  }
);

// Pre-save hook to update updatedAt
templateSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Template', templateSchema);
