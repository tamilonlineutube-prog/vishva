import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Copy, Eye, EyeOff, Loader2, FileText } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://vishva-backend.onrender.com";

interface Template {
  _id: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  body: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PENDING_INITIAL_REVIEW";
  metaTemplateId?: string;
  rejectionReason?: string;
  createdAt: string;
  accountId?: string;
}

export default function MessageTemplates() {
  const { user } = useAuth();
  const userId = user?.id;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "MARKETING" as const,
    body: "",
  });

  // Fetch templates
  useEffect(() => {
    if (!userId) return;

    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/templates?userId=${userId}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch templates");

        const data = await response.json();
        setTemplates(Array.isArray(data) ? data : data.templates || []);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();

    // Refresh every 30 seconds for status updates
    const interval = setInterval(fetchTemplates, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.body.trim()) {
      setError("Template name and body are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create template");
      }

      const newTemplate = await response.json();
      setTemplates((prev) => [newTemplate, ...prev]);
      setSuccess("Template created successfully!");
      setForm({ name: "", category: "MARKETING", body: "" });
      setShowForm(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error creating template:", err);
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`${API_URL}/api/templates/${templateId}?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      setTemplates((prev) => prev.filter((t) => t._id !== templateId));
      setSuccess("Template deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting template:", err);
      setError("Failed to delete template");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "PENDING_REVIEW":
      case "PENDING_INITIAL_REVIEW":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "REJECTED":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      APPROVED: { bg: "bg-green-50", text: "text-green-700", label: "Approved" },
      PENDING_REVIEW: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
      PENDING_INITIAL_REVIEW: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
      REJECTED: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
    };

    const badge = badges[status] || badges.PENDING_REVIEW;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {getStatusIcon(status)}
        {badge.label}
      </span>
    );
  };

  return (
    <AppLayout title="Message Templates">
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Message Templates</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage WhatsApp message templates
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-900 dark:text-green-100">{success}</p>
            </div>
          )}

          {/* Create Form */}
          {showForm && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Create New Template</h3>
              <form onSubmit={handleAddTemplate} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-foreground">Template Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Welcome Message"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose the appropriate category for your template
                  </p>
                </div>

                {/* Body */}
                <div>
                  <label className="text-sm font-medium text-foreground">Message Template</label>
                  <textarea
                    placeholder="Enter your message template. Use {{variable}} for dynamic content."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={6}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.body.length}/1024 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm({ name: "", category: "MARKETING", body: "" });
                    }}
                    className="flex-1 py-2 px-4 border border-border rounded-md hover:bg-secondary text-foreground font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Templates Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No templates yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {template.name}
                        </h3>
                        {getStatusBadge(template.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded">
                          {template.category}
                        </span>
                        <span>
                          Created{" "}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-3 bg-secondary rounded text-sm text-foreground whitespace-pre-wrap break-words max-h-32 overflow-hidden">
                        {template.body}
                      </div>

                      {template.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200">
                          <p className="font-medium">Rejection Reason:</p>
                          <p>{template.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          setPreviewId(previewId === template._id ? null : template._id)
                        }
                        title={previewId === template._id ? "Hide preview" : "Show preview"}
                        className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {previewId === template._id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => copyToClipboard(template.body, template._id)}
                        title="Copy template text"
                        className="p-2 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === template._id ? "✓" : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteTemplate(template._id)}
                        title="Delete template"
                        className="p-2 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
