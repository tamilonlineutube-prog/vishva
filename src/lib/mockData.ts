export const contacts = [];

export const conversations: Record<string, Array<{ id: string; text: string; sender: "customer" | "business"; time: string }>> = {};

export const campaigns = [];

export const templates = [];

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
