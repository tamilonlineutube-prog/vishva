import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { campaigns, templates } from "@/lib/mockData";
import { Upload, Send, CheckCircle2, Loader2, XCircle, ChevronRight, Download, File, AlertTriangle, AlertCircle } from "lucide-react";

const steps = ["Select Account", "Upload Contacts", "Select Template", "Review & Send"];

interface Account {
  _id: string;
  accountName: string;
  displayPhoneNumber: string;
  verificationStatus: string;
}

interface Template {
  _id: string;
  name: string;
  category: string;
  body: string;
  status: string;
  accountId: string;
}

interface Contact {
  name: string;
  phone: string;
}

interface CampaignHistory {
  id: string;
  templateName: string;
  totalContacts: number;
  successCount: number;
  failureCount: number;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  accountName: string;
}

export default function Campaigns() {
  const { user } = useAuth();
  const userId = user?.id;

  const [step, setStep] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || "https://vishva-backend.onrender.com";

  // Load campaign history and accounts on mount
  useEffect(() => {
    const saved = localStorage.getItem("campaignHistory");
    if (saved) {
      setCampaignHistory(JSON.parse(saved));
    }
    
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  // Fetch accounts from API
  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await fetch(`${API_URL}/api/accounts?userId=${userId}`);
      const data = await response.json();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fetch templates for selected account
  useEffect(() => {
    if (selectedAccount) {
      fetchTemplatesForAccount(selectedAccount);
    }
  }, [selectedAccount]);

  const fetchTemplatesForAccount = async (accountId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/templates?accountId=${accountId}&userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setAvailableTemplates(data.templates);
        setSelectedTemplate(""); // Reset template selection
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  const downloadSampleExcel = () => {
    // CSV format with proper phone numbers (country code + number)
    const csvContent = `Name,Phone Number
John Doe,919876543210
Priya Singh,918765432109
Amit Kumar,917654321098
Sneha Reddy,916543210987
Vikram Patel,915432109876`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", "sample_contacts.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    // Parse CSV/Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Log for debugging
        console.log("[CSV] File content length:", content.length);
        console.log("[CSV] First 500 chars:", content.substring(0, 500));

        // Detect delimiter (comma, semicolon, or tab)
        const lines = content.split(/\r?\n/).filter((line) => line.trim());
        
        if (lines.length === 0) {
          alert("CSV file is empty");
          return;
        }

        // Detect delimiter by checking first line
        const firstLine = lines[0];
        let delimiter = ",";
        if (firstLine.includes(";") && !firstLine.includes(",")) {
          delimiter = ";";
        } else if (firstLine.includes("\t")) {
          delimiter = "\t";
        }
        console.log("[CSV] Detected delimiter:", delimiter === "," ? "comma" : delimiter === ";" ? "semicolon" : "tab");

        // Skip header row and process data
        const dataLines = lines.slice(1);
        
        const parsedContacts: Contact[] = dataLines
          .filter((line) => line.trim()) // Remove empty lines
          .map((line, index) => {
            try {
              // Split by detected delimiter and clean up
              const fields = line.split(delimiter).map((col) => {
                // Remove quotes and trim whitespace
                return col
                  .trim()
                  .replace(/^["']|["']$/g, "")
                  .trim();
              });
              
              if (fields.length < 2) {
                console.warn(`[CSV] Line ${index + 2}: Not enough fields (${fields.length})`, fields);
                return null;
              }

              let name = fields[0] || "";
              let phone = fields[1] || "";

              if (!name || !phone) {
                console.warn(`[CSV] Line ${index + 2}: Empty name or phone`, { name, phone });
                return null;
              }

              // Clean phone: remove ALL non-digit characters first
              let cleanPhone = phone.replace(/\D/g, "");
              
              // Validate minimum length (at least 7 digits)
              if (!cleanPhone || cleanPhone.length < 7) {
                console.warn(`[CSV] Line ${index + 2}: Phone too short after cleaning`, { 
                  original: phone, 
                  cleaned: cleanPhone,
                  length: cleanPhone.length 
                });
                return null;
              }

              // Validate maximum length (at most 15 digits for E.164)
              if (cleanPhone.length > 15) {
                console.warn(`[CSV] Line ${index + 2}: Phone too long`, { 
                  original: phone, 
                  cleaned: cleanPhone,
                  length: cleanPhone.length 
                });
                return null;
              }

              // Clean name: remove control characters and limit length
              const cleanName = name
                .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
                .trim()
                .substring(0, 50); // Limit to 50 chars

              console.log(`[CSV] Line ${index + 2}: Valid contact`, { 
                name: cleanName, 
                phone: phone,
                cleaned: cleanPhone,
                length: cleanPhone.length 
              });

              return {
                name: cleanName,
                phone: cleanPhone,
              };
            } catch (lineError) {
              console.error(`[CSV] Error parsing line ${index + 2}:`, lineError);
              return null;
            }
          })
          .filter((contact) => contact !== null) as Contact[];

        if (parsedContacts.length === 0) {
          alert(
            "No valid contacts found in file. Please check the CSV format.\n\n" +
            "Expected format:\n" +
            "Name,Phone Number\n" +
            "John Doe,919876543210\n\n" +
            "Phone numbers should be digits only (e.g., 919876543210), between 7-15 digits."
          );
          return;
        }

        console.log(`[CSV] Successfully parsed ${parsedContacts.length} valid contacts out of ${dataLines.length} lines`);
        setContacts(parsedContacts);
        setStep(1); // Move to next step after upload
      } catch (error) {
        console.error("[CSV] Error reading file:", error);
        alert(`Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    };
    
    // Try UTF-8 first, fallback to ISO-8859-1
    try {
      reader.readAsText(file, "UTF-8");
    } catch {
      console.warn("[CSV] UTF-8 failed, trying ISO-8859-1");
      reader.readAsText(file, "ISO-8859-1");
    }
  };

  const handleSendCampaign = async () => {
    if (!selectedAccount) {
      alert("Please select an account");
      return;
    }

    const selectedAcct = accounts.find(a => a._id === selectedAccount);
    if (!selectedAcct) {
      alert("Account not found");
      return;
    }

    setIsSending(true);
    try {
      // Get the selected template
      const template = availableTemplates.find(t => t._id === selectedTemplate);
      if (!template) {
        alert("Please select a template");
        setIsSending(false);
        return;
      }

      // Send campaign via backend with account credentials
      const response = await fetch(`${API_URL}/api/send-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: template._id,
          templateName: template.name,
          templateBody: template.body,
          contacts: contacts.map((c) => ({
            name: c.name,
            phone: c.phone,
          })),
          accountId: selectedAccount,
          // Note: Backend should use account credentials from database
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Campaign send failed:", error);
        alert(`Failed to send campaign: ${error.message}`);
        setIsSending(false);
        return;
      }

      const result = await response.json();
      console.log("[Campaign] Sent successfully:", result);

      // Add to campaign history
      const newCampaign: CampaignHistory = {
        id: Date.now().toString(),
        templateName: template.name,
        totalContacts: contacts.length,
        successCount: result.data.successCount,
        failureCount: result.data.failureCount,
        timestamp: new Date().toLocaleString(),
        status: result.data.failureCount === 0 ? 'success' : result.data.successCount > 0 ? 'partial' : 'failed',
        accountName: selectedAcct.accountName,
      };

      const updated = [newCampaign, ...campaignHistory];
      setCampaignHistory(updated);
      localStorage.setItem("campaignHistory", JSON.stringify(updated));

      // Show success screen
      setSendSuccess(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setStep(0);
        setSendSuccess(false);
        setSelectedTemplate("");
        setUploadedFile(null);
        setContacts([]);
      }, 3000);
    } catch (error) {
      console.error("[Campaign] Error sending campaign:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsSending(false);
    }
  };

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
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No accounts configured. Please go to <strong>Accounts</strong> page to add your Meta business account first.
                </p>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="space-y-4 max-w-md">
                  <label className="text-sm font-medium text-foreground">Select Account</label>
                  <select
                    value={selectedAccount || ""}
                    onChange={(e) => {
                      setSelectedAccount(e.target.value);
                      setStep(1);
                    }}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">Choose an account...</option>
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountName} ({acc.displayPhoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {step === 1 && (
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Upload CSV or Excel file</p>
                  <p className="text-xs text-muted-foreground mb-4">Columns: Name, Phone Number</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] inline-flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Choose File
                    </button>

                    {uploadedFile && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-xs text-success">{uploadedFile.name} ({contacts.length} contacts)</span>
                      </div>
                    )}

                    <button
                      onClick={downloadSampleExcel}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download Sample
                    </button>
                  </div>

                  <div className="flex gap-2 pt-4 justify-center">
                    <button
                      onClick={() => setStep(0)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3 max-w-md">
                  <label className="text-sm font-medium text-foreground">Select Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">Choose a template...</option>
                    {availableTemplates.filter(t => t.status === "APPROVED").map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  {availableTemplates.length === 0 && (
                    <p className="text-xs text-muted-foreground">No approved templates. Create and approve a template first.</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!selectedTemplate}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 max-w-md">
                  <div className="bg-accent/50 rounded-lg p-4 text-sm">
                    <p className="font-medium text-foreground mb-2">Campaign Summary</p>
                    <p className="text-muted-foreground">Account: <span className="text-foreground font-medium">{accounts.find(a => a._id === selectedAccount)?.accountName}</span></p>
                    <p className="text-muted-foreground">Contacts: <span className="text-foreground font-medium">{contacts.length}</span></p>
                    <p className="text-muted-foreground">Template: <span className="text-foreground font-medium">{availableTemplates.find(t => t._id === selectedTemplate)?.name || selectedTemplate}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-input text-foreground hover:bg-secondary transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSendCampaign}
                      disabled={isSending || !selectedTemplate}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-[0.97] inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Campaign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Success State */}
              {sendSuccess && (
                <div className="space-y-4 max-w-md">
                  <div className="bg-success/10 border-2 border-success rounded-xl p-6 text-center animate-fade-in">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-foreground mb-2">Campaign Sent Successfully! 🎉</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Your campaign with {contacts.length} contacts has been queued for sending.
                    </p>
                    <div className="bg-accent/30 rounded-lg p-3 text-xs text-muted-foreground mb-4">
                      <p>Account: {accounts.find(a => a._id === selectedAccount)?.accountName}</p>
                      <p>Template: {availableTemplates.find(t => t._id === selectedTemplate)?.name}</p>
                      <p>Sent Time: {new Date().toLocaleTimeString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Redirecting to new campaign in 3 seconds...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Campaign History */}
        <div className="bg-card rounded-xl card-shadow animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Campaign History</h3>
          </div>
          <div className="overflow-x-auto">
            {campaignHistory.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <File className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No campaigns sent yet. Start creating your first campaign!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Failed</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignHistory.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-foreground">{campaign.templateName}</td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{campaign.accountName || "—"}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                          campaign.status === 'success' ? 'bg-success/10 text-success' : campaign.status === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {campaign.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : campaign.status === 'partial' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {campaign.status === 'success' ? 'Sent' : campaign.status === 'partial' ? 'Partial' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right tabular-nums text-foreground">{campaign.successCount}</td>
                      <td className="px-6 py-3.5 text-right tabular-nums text-destructive">{campaign.failureCount}</td>
                      <td className="px-6 py-3.5 text-muted-foreground text-xs">{campaign.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
