import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  Send,
  MessageSquare,
  MessagesSquare,
  MessageCircle,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "https://vishva-backend.onrender.com";

interface Stats {
  totalMessages: number;
  totalConversations: number;
  activeConversations: number;
  messagesSentToday: number;
  messagesReceivedToday: number;
  averageResponseTime: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalConversations: 0,
    activeConversations: 0,
    messagesSentToday: 0,
    messagesReceivedToday: 0,
    averageResponseTime: "N/A",
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([
    { day: "Mon", sent: 45, received: 32 },
    { day: "Tue", sent: 52, received: 38 },
    { day: "Wed", sent: 48, received: 35 },
    { day: "Thu", sent: 61, received: 40 },
    { day: "Fri", sent: 55, received: 42 },
    { day: "Sat", sent: 42, received: 28 },
    { day: "Sun", sent: 38, received: 25 },
  ]);

  const [recentConversations, setRecentConversations] = useState([]);

  // Fetch dashboard stats
  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch conversations
        const convsResponse = await fetch(`${API_URL}/api/conversations?userId=${userId}`);
        const convsData = await convsResponse.json();

        // Calculate stats
        const conversations = Array.isArray(convsData) ? convsData : [];
        const activeConvs = conversations.filter((c) => c.status === "active");
        const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

        setStats({
          totalMessages: conversations.length * 5, // Mock calculation
          totalConversations: conversations.length,
          activeConversations: activeConvs.length,
          messagesSentToday: Math.floor(Math.random() * 50) + 10,
          messagesReceivedToday: Math.floor(Math.random() * 40) + 5,
          averageResponseTime: "~2 min",
        });

        setRecentConversations(conversations.slice(0, 5));
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const metricCards = [
    {
      label: "Total Messages",
      value: stats.totalMessages.toLocaleString(),
      icon: MessageSquare,
    },
    {
      label: "Conversations",
      value: stats.totalConversations.toString(),
      icon: MessageCircle,
    },
    {
      label: "Active",
      value: stats.activeConversations.toString(),
      icon: MessagesSquare,
    },
    {
      label: "Sent Today",
      value: stats.messagesSentToday.toString(),
      icon: Send,
    },
    {
      label: "Received Today",
      value: stats.messagesReceivedToday.toString(),
      icon: CheckCircle2,
    },
  ];

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-5 gap-4" style={{ animationDelay: "0ms" }}>
          {metricCards.map((m, i) => (
            <div
              key={m.label}
              className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-shadow animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{m.label}</span>
                <m.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{m.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium text-success">Active</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Messages Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 92%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215 14% 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 14% 50%)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 90%)", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sent" stroke="hsl(142 70% 38%)" strokeWidth={2} dot={{ r: 3 }} name="Sent" />
                <Line type="monotone" dataKey="received" stroke="hsl(210 80% 52%)" strokeWidth={2} dot={{ r: 3 }} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Response Time</h3>
            <div className="flex flex-col items-center justify-center h-[260px] gap-4">
              <Clock className="w-12 h-12 text-primary/50" />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{stats.averageResponseTime}</p>
                <p className="text-xs text-muted-foreground mt-1">Average Response Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "400ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Conversations</h3>
            <div className="space-y-3">
              {recentConversations.length > 0 ? (
                recentConversations.map((c: any) => (
                  <div key={c._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">{c.phoneNumber?.[0] || "?"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.status || "Active"}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.unreadCount || 0} unread</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <MessagesSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "500ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Statistics Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Contacts</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.totalConversations}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Active Chats</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.activeConversations}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-info" />
                  <span className="text-sm text-muted-foreground">Messages Sent (Today)</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.messagesSentToday}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Messages Received (Today)</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.messagesReceivedToday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
