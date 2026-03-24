export const contacts = [
  { id: "1", name: "Rahul Sharma", phone: "+91 98765 43210", tags: ["Hot"], lastMessage: "Yes, I'm interested in the loan offer", lastMessageTime: "2 min ago", unread: 2, sessionActive: true },
  { id: "2", name: "Priya Patel", phone: "+91 87654 32109", tags: ["Interested"], lastMessage: "Can you share the EMI details?", lastMessageTime: "15 min ago", unread: 1, sessionActive: true },
  { id: "3", name: "Amit Kumar", phone: "+91 76543 21098", tags: ["Follow-up"], lastMessage: "I'll check and get back to you", lastMessageTime: "1 hr ago", unread: 0, sessionActive: true },
  { id: "4", name: "Sneha Reddy", phone: "+91 65432 10987", tags: ["Hot"], lastMessage: "Please send the application link", lastMessageTime: "3 hrs ago", unread: 0, sessionActive: false },
  { id: "5", name: "Vikram Singh", phone: "+91 54321 09876", tags: [], lastMessage: "Thank you for the information", lastMessageTime: "5 hrs ago", unread: 0, sessionActive: false },
  { id: "6", name: "Deepa Nair", phone: "+91 43210 98765", tags: ["Interested"], lastMessage: "What documents do I need?", lastMessageTime: "1 day ago", unread: 0, sessionActive: false },
  { id: "7", name: "Karan Mehta", phone: "+91 32109 87654", tags: [], lastMessage: "OK, I understand", lastMessageTime: "1 day ago", unread: 0, sessionActive: false },
  { id: "8", name: "Ananya Gupta", phone: "+91 21098 76543", tags: ["Follow-up"], lastMessage: "Let me discuss with my family", lastMessageTime: "2 days ago", unread: 0, sessionActive: false },
];

export const conversations: Record<string, Array<{ id: string; text: string; sender: "customer" | "business"; time: string }>> = {
  "1": [
    { id: "m1", text: "Hi, I saw your ad about personal loans", sender: "customer", time: "10:30 AM" },
    { id: "m2", text: "Hello Rahul! Yes, we have great offers. What amount are you looking for?", sender: "business", time: "10:31 AM" },
    { id: "m3", text: "Around 5 lakhs for home renovation", sender: "customer", time: "10:33 AM" },
    { id: "m4", text: "We can offer 5L at 10.5% p.a. with flexible EMI options. Shall I share the details?", sender: "business", time: "10:34 AM" },
    { id: "m5", text: "Yes, I'm interested in the loan offer", sender: "customer", time: "10:35 AM" },
  ],
  "2": [
    { id: "m1", text: "Hello, I received your message about the pre-approved loan", sender: "customer", time: "9:45 AM" },
    { id: "m2", text: "Hi Priya! Yes, you're pre-approved for up to 3L. Would you like to proceed?", sender: "business", time: "9:46 AM" },
    { id: "m3", text: "Can you share the EMI details?", sender: "customer", time: "9:50 AM" },
  ],
  "3": [
    { id: "m1", text: "Amit, following up on our conversation about the business loan", sender: "business", time: "Yesterday" },
    { id: "m2", text: "I'll check and get back to you", sender: "customer", time: "Yesterday" },
  ],
};

export const campaigns = [
  { id: "1", name: "Diwali Loan Offers", status: "Completed" as const, sent: 2450, delivered: 2380, read: 1890, failed: 70, date: "2024-10-20" },
  { id: "2", name: "EMI Reminder - Nov", status: "Completed" as const, sent: 1200, delivered: 1180, read: 950, failed: 20, date: "2024-11-01" },
  { id: "3", name: "New Year Cashback", status: "Running" as const, sent: 3100, delivered: 2900, read: 0, failed: 200, date: "2024-12-28" },
  { id: "4", name: "Credit Score Check", status: "Completed" as const, sent: 800, delivered: 790, read: 620, failed: 10, date: "2024-12-15" },
];

export const templates = [
  { id: "1", name: "loan_offer_v2", category: "Marketing" as const, status: "Approved" as const, body: "Hi {{1}}, great news! You're pre-approved for a loan up to ₹{{2}}. Apply now: {{3}}", updatedAt: "2024-12-20" },
  { id: "2", name: "emi_reminder", category: "Utility" as const, status: "Approved" as const, body: "Dear {{1}}, your EMI of ₹{{2}} is due on {{3}}. Pay now to avoid late charges.", updatedAt: "2024-12-18" },
  { id: "3", name: "welcome_message", category: "Marketing" as const, status: "Pending" as const, body: "Welcome {{1}}! Thank you for choosing us. Your account is ready. Start exploring: {{2}}", updatedAt: "2024-12-25" },
  { id: "4", name: "kyc_update", category: "Utility" as const, status: "Rejected" as const, body: "Hi {{1}}, please update your KYC documents by {{2}} to continue using our services.", updatedAt: "2024-12-10" },
  { id: "5", name: "festive_offer", category: "Marketing" as const, status: "Approved" as const, body: "🎉 {{1}}, exclusive festive offer! Get {{2}}% off on processing fees. Limited time: {{3}}", updatedAt: "2024-12-22" },
];

export const dashboardMetrics = {
  totalSent: 7550,
  totalReplies: 3460,
  activeConversations: 24,
  campaignsSent: 4,
  conversionRate: 12.8,
};

export const chartData = {
  messagesVsReplies: [
    { day: "Mon", sent: 180, replies: 82 },
    { day: "Tue", sent: 220, replies: 95 },
    { day: "Wed", sent: 195, replies: 88 },
    { day: "Thu", sent: 310, replies: 142 },
    { day: "Fri", sent: 275, replies: 120 },
    { day: "Sat", sent: 150, replies: 65 },
    { day: "Sun", sent: 90, replies: 38 },
  ],
  campaignPerformance: [
    { name: "Diwali Offers", delivered: 2380, read: 1890, failed: 70 },
    { name: "EMI Reminder", delivered: 1180, read: 950, failed: 20 },
    { name: "NY Cashback", delivered: 2900, read: 0, failed: 200 },
    { name: "Credit Score", delivered: 790, read: 620, failed: 10 },
  ],
};
