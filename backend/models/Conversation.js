const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true, // WhatsApp phone number or ID
    },
    customerName: String,
    customerPhone: String,
    lastMessage: String,
    lastMessageTime: Date,
    unreadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
    },
    tags: [String],
    notes: String,
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

// Index for faster queries
conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ userId: 1, customerId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
