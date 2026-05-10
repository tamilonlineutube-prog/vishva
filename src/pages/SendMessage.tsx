import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Send, AlertCircle, CheckCircle, Loader2, Phone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://vishva-backend.onrender.com";

interface Account {
  _id: string;
  accountName: string;
  displayPhoneNumber: string;
  phoneNumberId: string;
  isVerified: boolean;
}

interface Template {
  _id: string;
  name: string;
  category: string;
  status: string;
}

export default function SendMessage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [useTemplate, setUseTemplate] = useState<boolean>(true);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);

  // Fetch accounts
  useEffect(() => {
    if (!userId) return;

    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accounts?userId=${userId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch accounts");

        const data = await response.json();
        // Filter only verified accounts
        const verifiedAccounts = data.filter((acc: Account) => acc.isVerified);
        setAccounts(verifiedAccounts);

        if (verifiedAccounts.length === 0) {
          setError("No verified accounts. Please verify your accounts first.");
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load accounts");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [userId]);

  // Fetch templates
  useEffect(() => {
    if (!userId) return;

    const fetchTemplates = async () => {
      try {
        const response = await fetch(`${API_URL}/api/templates?userId=${userId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch templates");

        const data = await response.json();
        // Filter only approved templates
        const approvedTemplates = data.filter((t: Template) => t.status === "APPROVED");
        setTemplates(approvedTemplates);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setMessageId(null);

    if (!selectedAccount) {
      setError("Please select an account");
      return;
    }

    if (!recipientPhone) {
      setError("Please enter recipient phone number");
      return;
    }

    // Validate phone number format (basic validation)
    if (!/^\d{10,15}$/.test(recipientPhone.replace(/\D/g, ""))) {
      setError("Invalid phone number format");
      return;
    }

    if (useTemplate && !selectedTemplate) {
      setError("Please select a template");
      return;
    }

    if (!useTemplate && !messageText.trim()) {
      setError("Please enter a message");
      return;
    }

    try {
      setSending(true);

      const endpoint = useTemplate ? "/api/messages/send" : "/api/messages/send-text";

      const payload = {
        accountId: selectedAccount,
        recipientPhone: recipientPhone.replace(/\D/g, ""), // Remove non-digits
        userId,
        ...(useTemplate
          ? {
              templateName: selectedTemplate,
              templateLanguage: "en_US",
              templateParams: [],
            }
          : {
              message: messageText,
            }),
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccess(`Message sent successfully!`);
      setMessageId(data.messageId);

      // Reset form
      setRecipientPhone("");
      setSelectedTemplate("");
      setMessageText("");

      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout title="Send Message">
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">Send Message</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Send WhatsApp messages using your verified accounts
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">{success}</p>
                {messageId && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Message ID: {messageId}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSendMessage} className="space-y-6 bg-card border border-border rounded-lg p-6">
            {/* Account Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select Account
              </label>
              {loadingAccounts ? (
                <div className="flex items-center gap-2 p-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading accounts...
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-3 bg-muted rounded border border-border text-sm text-muted-foreground">
                  No verified accounts available. Please verify accounts first.
                </div>
              ) : (
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountName} ({acc.displayPhoneNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Recipient Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Recipient Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="e.g., +918939798881 or 918939798881"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +91 for India)
              </p>
            </div>

            {/* Message Type Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={useTemplate}
                    onChange={() => setUseTemplate(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Template</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useTemplate}
                    onChange={() => setUseTemplate(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Free Text</span>
                </label>
              </div>
            </div>

            {/* Template Selection or Message Text */}
            {useTemplate ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Select Template
                </label>
                {loadingTemplates ? (
                  <div className="flex items-center gap-2 p-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading templates...
                  </div>
                ) : templates.length === 0 ? (
                  <div className="p-3 bg-muted rounded border border-border text-sm text-muted-foreground">
                    No approved templates available.
                  </div>
                ) : (
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Select Template --</option>
                    {templates.map((template) => (
                      <option key={template._id} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Message Text
                </label>
                <textarea
                  placeholder="Enter your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending || loadingAccounts || (useTemplate && loadingTemplates)}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Messages sent via WhatsApp API will be delivered to the recipient's WhatsApp. Status updates and delivery confirmations will be tracked.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
