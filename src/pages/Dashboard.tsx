import { AppLayout } from "@/components/AppLayout";
import { dashboardMetrics, chartData, contacts } from "@/lib/mockData";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import {
  Send,
  MessageSquare,
  MessagesSquare,
  Megaphone,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Flame,
  Star,
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

interface DashboardMetrics {
  totalSent: number;
  totalReplies: number;
  activeConversations: number;
  campaignsSent: number;
  conversionRate: number;
}

export default function Dashboard() {
  const [dashMetrics, setDashMetrics] = useState<DashboardMetrics>({
    totalSent: dashboardMetrics.totalSent,
    totalReplies: dashboardMetrics.totalReplies,
    activeConversations: dashboardMetrics.activeConversations,
    campaignsSent: dashboardMetrics.campaignsSent,
    conversionRate: dashboardMetrics.conversionRate,
  });

  useEffect(() => {
    console.log("[Dashboard] Setting up Socket.io listeners for metrics");

    const handleMessageSent = (data: any) => {
      console.log("[Dashboard] Message sent event:", data);
      setDashMetrics((prev) => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        activeConversations: prev.activeConversations + 1,
      }));
    };

    const handleMessageReceived = (data: any) => {
      console.log("[Dashboard] Message received event:", data);
      setDashMetrics((prev) => ({
        ...prev,
        totalReplies: prev.totalReplies + 1,
      }));
    };

    socket.on("message_sent", handleMessageSent);
    socket.on("new_message", handleMessageReceived);
    socket.on("message_delivered", () => {
      console.log("[Dashboard] Message delivered");
    });

    console.log("[Dashboard] Socket.io listeners attached");

    return () => {
      console.log("[Dashboard] Cleaning up Socket.io listeners");
      socket.off("message_sent", handleMessageSent);
      socket.off("new_message", handleMessageReceived);
    };
  }, []);

  const metricCards = [
    { label: "Messages Sent", value: dashMetrics.totalSent.toLocaleString(), trend: "+12.5%", up: true, icon: Send },
    { label: "Replies Received", value: dashMetrics.totalReplies.toLocaleString(), trend: "+8.2%", up: true, icon: MessageSquare },
    { label: "Active Conversations", value: dashMetrics.activeConversations.toString(), trend: "-3", up: false, icon: MessagesSquare },
    { label: "Campaigns Sent", value: dashMetrics.campaignsSent.toString(), trend: "+1", up: true, icon: Megaphone },
    { label: "Conversion Rate", value: `${dashMetrics.conversionRate}%`, trend: "+2.1%", up: true, icon: TrendingUp },
  ];

  const hotLeads = contacts.filter((c) => c.tags.includes("Hot") || c.tags.includes("Interested"));

  return (
    <AppLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-5 gap-4" style={{ animationDelay: "0ms" }}>
          {metricCards.map((m, i) => (
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{m.label}</span>
                <m.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">{m.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {m.up ? (
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                )}
                <span className={`text-xs font-medium ${m.up ? "text-success" : "text-destructive"}`}>{m.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Messages vs Replies (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData.messagesVsReplies}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 92%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215 14% 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 14% 50%)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 90%)", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sent" stroke="hsl(142 70% 38%)" strokeWidth={2} dot={{ r: 3 }} name="Sent" />
                <Line type="monotone" dataKey="replies" stroke="hsl(210 80% 52%)" strokeWidth={2} dot={{ r: 3 }} name="Replies" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Campaign Performance</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData.campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 92%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215 14% 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 14% 50%)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(214 20% 90%)", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="delivered" fill="hsl(142 70% 38%)" radius={[4, 4, 0, 0]} name="Delivered" />
                <Bar dataKey="read" fill="hsl(210 80% 52%)" radius={[4, 4, 0, 0]} name="Read" />
                <Bar dataKey="failed" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "400ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Recent Conversations</h3>
            <div className="space-y-3">
              {contacts.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">{c.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{c.lastMessageTime}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in" style={{ animationDelay: "500ms" }}>
            <h3 className="text-sm font-semibold text-foreground mb-4">Hot Leads & Follow-ups</h3>
            <div className="space-y-3">
              {hotLeads.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">{c.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          tag === "Hot"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-info/10 text-info"
                        }`}
                      >
                        {tag === "Hot" ? <Flame className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
