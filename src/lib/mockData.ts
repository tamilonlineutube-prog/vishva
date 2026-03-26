export const contacts = [];

export const conversations: Record<string, Array<{ id: string; text: string; sender: "customer" | "business"; time: string }>> = {};

export const campaigns = [];

export const templates = [
  { 
    id: "1", 
    name: "loan_approval_offer", 
    category: "Marketing" as const, 
    status: "Approved" as const, 
    body: "Hi {{1}}, great news! 🎉 You're pre-approved for a loan of ₹{{2}}. Apply now and get approved in 24 hours: {{3}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "2", 
    name: "emi_reminder", 
    category: "Utility" as const, 
    status: "Approved" as const, 
    body: "Hi {{1}}, your EMI of ₹{{2}} is due on {{3}}. Pay now to avoid late charges. Quick pay link: {{4}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "3", 
    name: "loan_application_status", 
    category: "Utility" as const, 
    status: "Approved" as const, 
    body: "Hi {{1}}, your loan application (Ref: {{2}}) is now {{3}}. You will receive the funds within {{4}} hours. Tracking: {{5}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "4", 
    name: "kyc_verification_pending", 
    category: "Utility" as const, 
    status: "Approved" as const, 
    body: "Hi {{1}}, to complete your loan process, please submit your KYC documents. Upload here: {{2}}\n\nDocuments needed:\n• Aadhar\n• PAN\n• Address Proof", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "5", 
    name: "special_offer", 
    category: "Marketing" as const, 
    status: "Approved" as const, 
    body: "🎊 Special Offer for You!\n\nHi {{1}}, get {{2}}% discount on processing fees for loans above ₹{{3}}.\n\nOffer valid till {{4}}\nApply: {{5}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "6", 
    name: "payment_confirmation", 
    category: "Utility" as const, 
    status: "Approved" as const, 
    body: "✅ Payment Successful!\n\nHi {{1}}, your payment of ₹{{2}} has been received.\n\nTransaction ID: {{3}}\nNext EMI Date: {{4}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "7", 
    name: "welcome_new_customer", 
    category: "Marketing" as const, 
    status: "Approved" as const, 
    body: "Welcome {{1}}! 👋\n\nThank you for choosing us for your financial needs. Get instant loans up to ₹{{2}} with flexible repayment options.\n\nExplore: {{3}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "8", 
    name: "loan_disbursement", 
    category: "Utility" as const, 
    status: "Approved" as const, 
    body: "💰 Loan Disbursed!\n\nHi {{1}}, your loan of ₹{{2}} has been disbursed to your account {{3}}.\n\nDate: {{4}}\nEMI Amount: ₹{{5}}\nFirst Payment Date: {{6}}", 
    updatedAt: "2026-03-24" 
  },
  { 
    id: "9", 
    name: "hello_world_meta_test", 
    category: "Marketing" as const, 
    status: "Approved" as const, 
    body: "Hello World\n\nWelcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.", 
    updatedAt: "2026-03-26" 
  },
];

export const dashboardMetrics = {
  totalSent: 0,
  totalReplies: 0,
  activeConversations: 0,
  campaignsSent: 0,
  conversionRate: 0,
};

export const chartData = {
  messagesVsReplies: [],
  campaignPerformance: [],
};
