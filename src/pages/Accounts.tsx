import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit2, Trash2, Check, AlertCircle, RefreshCw, Eye, EyeOff, Copy } from "lucide-react";

interface Account {
  _id: string;
  accountName: string;
  businessAccountId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verificationStatus: "VERIFIED" | "PENDING" | "FAILED" | "REJECTED";
  isVerified: boolean;
  lastVerificationCheck?: string;
  verificationError?: string;
  createdAt: string;
}

interface NewAccountForm {
  accountName: string;
  businessAccountId: string;
  whatsappAccessToken: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
}

const API_URL = import.meta.env.VITE_API_URL || "https://vishva-backend.onrender.com";

export default function Accounts() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState<Set<string>>(new Set());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [form, setForm] = useState<NewAccountForm>({
    accountName: "",
    businessAccountId: "",
    whatsappAccessToken: "",
    phoneNumberId: "",
    displayPhoneNumber: "",
  });

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/accounts?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId) {
      setError("User authentication required. Please refresh and try again.");
      return;
    }

    if (
      !form.accountName ||
      !form.businessAccountId ||
      !form.whatsappAccessToken ||
      !form.phoneNumberId ||
      !form.displayPhoneNumber
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setSubmitting("new");
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add account");
      }

      const newAccount = await response.json();
      setAccounts((prev) => [newAccount, ...prev]);
      setSuccess("Account added successfully!");
      setForm({
        accountName: "",
        businessAccountId: "",
        whatsappAccessToken: "",
        phoneNumberId: "",
        displayPhoneNumber: "",
      });
      setShowForm(false);

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error adding account:", err);
      setError(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setSubmitting(null);
    }
  };

  const handleVerifyAccount = async (accountId: string) => {
    try {
      if (!userId) {
        setError("User authentication required. Please refresh and try again.");
        return;
      }

      setVerifying(accountId);
      setError(null);

      const response = await fetch(`${API_URL}/api/accounts/${accountId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify account");
      }

      const result = await response.json();
      
      // Update account in list
      setAccounts((prev) =>
        prev.map((acc) =>
          acc._id === accountId
            ? {
                ...acc,
                verificationStatus: result.account.verificationStatus,
                isVerified: result.account.isVerified,
              }
            : acc
        )
      );

      if (result.verification.success) {
        setSuccess(`✓ Account verified: ${result.verification.verifiedName || "Standard account"}`);
      } else {
        setError(`Verification failed: ${result.verification.error}`);
      }

      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    } catch (err) {
      console.error("Error verifying account:", err);
      setError(err instanceof Error ? err.message : "Failed to verify account");
    } finally {
      setVerifying(null);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) {
      return;
    }

    if (!userId) {
      setError("User authentication required. Please refresh and try again.");
      return;
    }

    try {
      setSubmitting(accountId);
      const response = await fetch(`${API_URL}/api/accounts/${accountId}?userId=${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      setAccounts((prev) => prev.filter((acc) => acc._id !== accountId));
      setSuccess("Account deleted successfully");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account");
    } finally {
      setSubmitting(null);
    }
  };

  const toggleShowToken = (accountId: string) => {
    setShowTokens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <AppLayout>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meta Accounts</h1>
            <p className="text-muted-foreground mt-2">
              Manage your WhatsApp Business Account credentials
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setForm({
                accountName: "",
                businessAccountId: "",
                whatsappAccessToken: "",
                phoneNumberId: "",
                displayPhoneNumber: "",
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-gap-2">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Add Account Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-card rounded-2xl border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? "Edit Account" : "Add New Account"}
            </h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={form.accountName}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Business Account"
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Business Account ID
                  </label>
                  <input
                    type="text"
                    name="businessAccountId"
                    value={form.businessAccountId}
                    onChange={handleInputChange}
                    placeholder="Your Meta Business Account ID"
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    name="phoneNumberId"
                    value={form.phoneNumberId}
                    onChange={handleInputChange}
                    placeholder="WhatsApp Phone Number ID"
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Display Phone Number
                  </label>
                  <input
                    type="text"
                    name="displayPhoneNumber"
                    value={form.displayPhoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  WhatsApp Access Token
                </label>
                <input
                  type="password"
                  name="whatsappAccessToken"
                  value={form.whatsappAccessToken}
                  onChange={handleInputChange}
                  placeholder="Your Meta API Access Token"
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({
                      accountName: "",
                      businessAccountId: "",
                      whatsappAccessToken: "",
                      phoneNumberId: "",
                      displayPhoneNumber: "",
                    });
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting !== null}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                >
                  {submitting ? "Adding..." : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No accounts added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {account.accountName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {account.displayPhoneNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {account.verificationStatus === "VERIFIED" && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Verified</span>
                      </div>
                    )}
                    {account.verificationStatus === "FAILED" && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 rounded-full">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Failed</span>
                      </div>
                    )}
                    {account.verificationStatus === "PENDING" && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 rounded-full">
                        <RefreshCw className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">Pending</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Business Account ID</p>
                    <p className="text-sm font-mono text-foreground">{account.businessAccountId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number ID</p>
                    <p className="text-sm font-mono text-foreground">{account.phoneNumberId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Added</p>
                    <p className="text-sm text-foreground">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Verified</p>
                    <p className="text-sm text-foreground">
                      {account.lastVerificationCheck
                        ? new Date(account.lastVerificationCheck).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleVerifyAccount(account._id)}
                    disabled={verifying === account._id}
                    className="p-2 rounded-md text-purple-600 hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                    title="Verify account with Meta"
                  >
                    {verifying === account._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    disabled={submitting === account._id}
                    className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    title="Delete account"
                  >
                    {submitting === account._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
