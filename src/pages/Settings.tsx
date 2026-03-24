import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connected" | "error">("idle");
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "connected" | "error">("idle");
  const [sessionWarning, setSessionWarning] = useState(true);

  return (
    <AppLayout title="Settings">
      <div className="p-6 max-w-2xl space-y-6">
        {/* WhatsApp API Config */}
        <section className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">WhatsApp API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Access Token</label>
              <input type="password" placeholder="EAAxxxxxxx..." className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Phone Number ID</label>
                <input type="text" placeholder="1234567890" className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Business Account ID</label>
                <input type="text" placeholder="9876543210" className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]">Save</button>
              <button
                onClick={() => setConnectionStatus(connectionStatus === "connected" ? "idle" : "connected")}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors active:scale-[0.97]"
              >
                Test Connection
              </button>
              {connectionStatus === "connected" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Connected</span>
              )}
            </div>
          </div>
        </section>

        {/* Webhook Config */}
        <section className="bg-card rounded-xl p-6 card-shadow animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Webhook Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Webhook URL</label>
              <input type="url" placeholder="https://your-domain.com/webhook" className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Verify Token</label>
              <input type="text" placeholder="your_verify_token" className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWebhookStatus(webhookStatus === "connected" ? "idle" : "connected")}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors active:scale-[0.97]"
              >
                Verify Webhook
              </button>
              {webhookStatus === "connected" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
              )}
              {webhookStatus === "error" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="w-3.5 h-3.5" /> Failed</span>
              )}
            </div>
          </div>
        </section>

        {/* Messaging Rules */}
        <section className="bg-card rounded-xl p-6 card-shadow animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Messaging Rules</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">24-Hour Session Warning</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show warning when customer session window is about to expire</p>
            </div>
            <button
              onClick={() => setSessionWarning(!sessionWarning)}
              className={`relative w-10 h-6 rounded-full transition-colors ${sessionWarning ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-transform ${sessionWarning ? "left-5" : "left-1"}`} />
            </button>
          </div>
        </section>

        {/* Defaults */}
        <section className="bg-card rounded-xl p-6 card-shadow animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Defaults</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Campaign Delay (seconds between messages)</label>
              <input type="number" defaultValue={2} className="w-32 px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 tabular-nums" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Timezone</label>
              <select className="w-64 px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option>Asia/Kolkata (IST)</option>
                <option>UTC</option>
                <option>America/New_York (EST)</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-card rounded-xl p-6 border-2 border-destructive/20 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mb-4">These actions are irreversible</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.97]">
              Reset System
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity active:scale-[0.97]">
              Disconnect WhatsApp
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
