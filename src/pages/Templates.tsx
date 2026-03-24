import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { templates } from "@/lib/mockData";
import { Plus, Eye, Pencil, Trash2, CheckCircle2, Clock, XCircle, X } from "lucide-react";

interface TemplateForm {
  name: string;
  category: "Marketing" | "Utility";
  body: string;
}

export default function Templates() {
  const [showCreate, setShowCreate] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<TemplateForm>({ name: "", category: "Marketing", body: "" });
  const [templateList, setTemplateList] = useState(templates);

  const previewTemplate = templateList.find((t) => t.id === preview);

  const handleEditOpen = (template: typeof templates[0]) => {
    setEditId(template.id);
    setEditData({ name: template.name, category: template.category, body: template.body });
  };

  const handleEditSave = () => {
    setTemplateList(
      templateList.map((t) =>
        t.id === editId ? { ...t, ...editData, updatedAt: new Date().toISOString().split("T")[0] } : t
      )
    );
    setEditId(null);
    setEditData({ name: "", category: "Marketing", body: "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplateList(templateList.filter((t) => t.id !== id));
    }
  };

  return (
    <AppLayout title="Templates">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <p className="text-sm text-muted-foreground">Manage your WhatsApp message templates</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>

        {/* Template List */}
        <div className="bg-card rounded-xl card-shadow animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Template Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templateList.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-sm font-medium text-foreground">{t.name}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        t.category === "Marketing" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        t.status === "Approved" ? "bg-success/10 text-success"
                        : t.status === "Pending" ? "bg-warning/10 text-warning-foreground"
                        : "bg-destructive/10 text-destructive"
                      }`}>
                        {t.status === "Approved" ? <CheckCircle2 className="w-3 h-3" /> : t.status === "Pending" ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{t.updatedAt}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreview(t.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEditOpen(t)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20" onClick={() => setPreview(null)}>
            <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 card-shadow-hover animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Template Preview</h3>
                <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-accent/50 rounded-xl p-4 mb-3">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{previewTemplate.body}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Category: {previewTemplate.category}</span>
                <span>•</span>
                <span>Status: {previewTemplate.status}</span>
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
                <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Category</label>
                    <select 
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value as "Marketing" | "Utility" })}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <option>Marketing</option>
                      <option>Utility</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Status</label>
                    <select className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20">
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Message Body</label>
                  <textarea 
                    rows={4} 
                    value={editData.body}
                    onChange={(e) => setEditData({ ...editData, body: e.target.value })}
                    placeholder="Hi {'{'}1{'}'}, your loan of ₹{'{'}2{'}'} is approved..." 
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" 
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Use {'{'}1{'}'}, {'{'}2{'}'}, {'{'}3{'}'}, etc. for variables</p>
                </div>
                <button
                  onClick={handleEditSave}
                  className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]"
                >
                  Save Changes
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
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Template Name</label>
                  <input type="text" placeholder="e.g., payment_reminder" className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Category</label>
                    <select className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20">
                      <option>Marketing</option>
                      <option>Utility</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">Language</label>
                    <select className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Tamil</option>
                      <option>Kannada</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Message Body</label>
                  <textarea rows={4} placeholder="Hi {'{'}1{'}'}, your loan of ₹{'{'}2{'}'} is approved..." className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
                  <p className="mt-2 text-xs text-muted-foreground">Use {'{'}1{'}'}, {'{'}2{'}'}, {'{'}3{'}'}, etc. for variables</p>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-full py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97]"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
    </AppLayout>
  );
}
