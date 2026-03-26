import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Eye, Pencil, Trash2, CheckCircle2, Clock, XCircle, X, Send, RefreshCw, AlertCircle } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  displayPhoneNumber: string;
  verificationStatus: string;
}

interface Template {
  _id: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  body: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PENDING_INITIAL_REVIEW";
  metaStatus: string;
  submittedToMeta: boolean;
  metaTemplateId?: string;
  rejectionReason?: string;
  submittedAt?: string;
  updatedAt: string;
  accountId?: string;
}

interface TemplateForm {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  body: string;
  accountId?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "https://vishva-backend.onrender.com";

export default function Templates() {
  const { user } = useAuth();
  const userId = user?.id;

  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [editData, setEditData] = useState<TemplateForm>({ name: "", category: "MARKETING", body: "" });
  const [createData, setCreateData] = useState<TemplateForm>({ name: "", category: "MARKETING", body: "", accountId: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch accounts and templates on mount
  useEffect(() => {
    if (userId) {
      fetchAccounts();
      fetchTemplates();
    }
    // Auto refresh status every 30 seconds for templates submitted to Meta
    const interval = setInterval(fetchTemplates, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await fetch(`${API_URL}/api/accounts?userId=${userId}`);
      const data = await response.json();
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplateList(data.templates);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const previewTemplate = templateList.find((t) => t._id === preview);

  const handleEditOpen = (template: Template) => {
    setEditId(template._id);
    setEditData({ name: template.name, category: template.category, body: template.body });
  };

  const handleEditSave = async () => {
    if (!editData.name.trim() || !editData.body.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/templates/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (data.success) {
        setTemplateList(templateList.map((t) => (t._id === editId ? data.template : t)));
        setEditId(null);
        setSuccess("Template updated successfully");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSave = async () => {
    if (!createData.name.trim() || !createData.body.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!selectedAccountId) {
      setError("Please select an account");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createData,
          accountId: selectedAccountId,
          userId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTemplateList([...templateList, data.template]);
        setShowCreate(false);
        setCreateData({ name: "", category: "MARKETING", body: "", accountId: "" });
        setSuccess("Template created successfully. Submit to Meta for approval.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/templates/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        setTemplateList(templateList.filter((t) => t._id !== id));
        setSuccess("Template deleted");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToMeta = async (id: string) => {
    try {
      setSubmitting(id);
      setError(null);
      const response = await fetch(`${API_URL}/api/templates/${id}/submit-to-meta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        setTemplateList(templateList.map((t) => (t._id === id ? data.template : t)));
        setSuccess("Template submitted to Meta for review. Check status in a few moments.");
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to submit template to Meta");
    } finally {
      setSubmitting(null);
    }
  };

  const handleApproveLocally = async (id: string) => {
    try {
      setSubmitting(id);
      setError(null);
      const response = await fetch(`${API_URL}/api/templates/${id}/approve-locally`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        setTemplateList(templateList.map((t) => (t._id === id ? data.template : t)));
        setSuccess("✅ Template approved and ready to use in campaigns!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to approve template");
    } finally {
      setSubmitting(null);
    }
  };

  const handleCheckStatus = async (id: string) => {
    try {
      setCheckingStatus(id);
      setError(null);
      const response = await fetch(`${API_URL}/api/templates/${id}/check-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.success) {
        setTemplateList(templateList.map((t) => (t._id === id ? data.template : t)));
        setSuccess(`Status: ${data.template.metaStatus}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to check template status");
    } finally {
      setCheckingStatus(null);
    }
  };

  const handleImportFromMeta = async () => {
    try {
      setImporting(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/templates/meta/fetch-all`);

      const data = await response.json();
      if (data.success) {
        setTemplateList(data.templates);
        const msg = `Imported ${data.imported.length} new templates from Meta. ${data.skipped.length} were already imported.`;
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to import templates from Meta");
    } finally {
      setImporting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "APPROVED") return <CheckCircle2 className="w-3 h-3" />;
    if (status === "REJECTED") return <XCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  return (
    <AppLayout title="Templates">
      <div className="p-6 space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground">Manage and submit WhatsApp templates to Meta for approval</p>
            <p className="text-xs text-muted-foreground mt-1">Status updates automatically every 30 seconds</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImportFromMeta}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
            >
              {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Import from Meta
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" /> Create Template
            </button>
          </div>
        </div>

        {/* Template List */}
        <div className="bg-card rounded-xl card-shadow animate-fade-in" style={{ animationDelay: "100ms" }}>
          {loading && !templateList.length ? (
            <div className="p-8 text-center text-muted-foreground">Loading templates...</div>
          ) : templateList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No templates yet. Create one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Meta Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Submitted</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templateList.map((t) => (
                    <tr key={t._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-foreground">{t.name}</td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs py-1 px-2 rounded-full bg-primary/10 text-primary">{t.category}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                            t.metaStatus === "APPROVED"
                              ? "bg-green-500/10 text-green-600"
                              : t.metaStatus === "REJECTED"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {statusIcon(t.metaStatus)}
                          {t.metaStatus || "NOT SUBMITTED"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-muted-foreground">
                        {t.submittedToMeta ? `✓ ${new Date(t.submittedAt!).toLocaleDateString()}` : "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreview(t._id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!t.submittedToMeta ? (
                            <>
                              <button
                                onClick={() => handleEditOpen(t)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSubmitToMeta(t._id)}
                                disabled={submitting === t._id}
                                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                                title="Submit to Meta for approval"
                              >
                                {submitting === t._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                              {t.status !== 'APPROVED' && (
                                <button
                                  onClick={() => handleApproveLocally(t._id)}
                                  disabled={submitting === t._id}
                                  className="p-1.5 rounded-md text-green-600 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                                  title="Approve locally for immediate use"
                                >
                                  {submitting === t._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleCheckStatus(t._id)}
                              disabled={checkingStatus === t._id}
                              className="p-1.5 rounded-md text-purple-600 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                              title="Check approval status"
                            >
                              {checkingStatus === t._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(t._id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20" onClick={() => setPreview(null)}>
            <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 card-shadow-hover animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Template Preview</h3>
                <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-accent/50 rounded-xl p-4 mb-3">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{previewTemplate.body}</p>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>Category: {previewTemplate.category}</div>
                <div>Status: {previewTemplate.metaStatus || "NOT SUBMITTED"}</div>
                {previewTemplate.rejectionReason && <div className="text-red-600">Rejection: {previewTemplate.rejectionReason}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20" onClick={() => setEditId(null)}>
            <div className="bg-card rounded-2xl p-6 max-w-lg w-full mx-4 card-shadow-hover animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Edit Template</h3>
                <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Template Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="e.g., payment_reminder"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value as "MARKETING" | "UTILITY" | "AUTHENTICATION" })}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option>MARKETING</option>
                    <option>UTILITY</option>
                    <option>AUTHENTICATION</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Message Body</label>
                  <textarea
                    rows={4}
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    placeholder="Your message template..."
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                  />
                </div>
                <button
                  onClick={handleEditSave}
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20" onClick={() => setShowCreate(false)}>
            <div className="bg-card rounded-2xl p-6 max-w-lg w-full mx-4 card-shadow-hover animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground">Create New Template</h3>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {accounts.length === 0 && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 ml-2">Please add an account in the Accounts page first</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Account</label>
                  <select
                    value={selectedAccountId || ""}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    disabled={accounts.length === 0}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                  >
                    <option value="">Select an account...</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountName} ({acc.displayPhoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Template Name</label>
                  <input
                    type="text"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    placeholder="e.g., hello_world"
                    disabled={accounts.length === 0}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Category</label>
                  <select
                    value={createData.category}
                    onChange={(e) => setCreateData({ ...createData, category: e.target.value as "MARKETING" | "UTILITY" | "AUTHENTICATION" })}
                    disabled={accounts.length === 0}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                  >
                    <option>MARKETING</option>
                    <option>UTILITY</option>
                    <option>AUTHENTICATION</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Message Body</label>
                  <textarea
                    rows={4}
                    value={createData.body}
                    onChange={(e) => setCreateData({ ...createData, body: e.target.value })}
                    placeholder="Your message template..."
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                  />
                </div>
                <button
                  onClick={handleCreateSave}
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Template"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
