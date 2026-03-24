import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { campaigns, templates } from "@/lib/mockData";
import { Upload, Send, CheckCircle2, Loader2, XCircle, ChevronRight } from "lucide-react";

const steps = ["Upload Contacts", "Select Template", "Map Variables", "Review & Send"];

export default function Campaigns() {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  return (
    <AppLayout title="Campaigns">
      <div className="p-6 space-y-6">
        {/* New Campaign */}
        <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-5">Create New Campaign</h3>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  <span>{i + 1}</span>
                  <span>{s}</span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 0 && (
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Upload CSV or Excel file</p>
              <p className="text-xs text-muted-foreground mb-4">Columns: Name, Phone Number</p>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]"
              >
                Upload File
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3 max-w-md">
              <label className="text-sm font-medium text-foreground">Select Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="">Choose a template...</option>
                {templates.filter(t => t.status === "Approved").map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(0)} className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors">Back</button>
                <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]">Next</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 max-w-md">
              <p className="text-sm font-medium text-foreground">Map Variables</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">{"{{1}}"}</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm text-foreground">Name (from CSV)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">{"{{2}}"}</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm text-foreground">Custom Link</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 max-w-md">
              <div className="bg-accent/50 rounded-lg p-4 text-sm">
                <p className="font-medium text-foreground mb-2">Campaign Summary</p>
                <p className="text-muted-foreground">Contacts: <span className="text-foreground font-medium">247</span></p>
                <p className="text-muted-foreground">Template: <span className="text-foreground font-medium">loan_offer_v2</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors">Back</button>
                <button onClick={() => setStep(0)} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] inline-flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Campaign
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Campaign History */}
        <div className="bg-card rounded-xl card-shadow animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Campaign History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivered</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Read</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Failed</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-foreground">{c.name}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        c.status === "Completed" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                      }`}>
                        {c.status === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-foreground">{c.sent.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-foreground">{c.delivered.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-foreground">{c.read.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-destructive">{c.failed.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
