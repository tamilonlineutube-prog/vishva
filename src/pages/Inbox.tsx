import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { contacts as mockContacts, conversations as mockConversations } from "@/lib/mockData";
import { socket } from "@/lib/socket";
import { Search, Send, Paperclip, Clock, AlertTriangle, Flame, Star, ArrowRight } from "lucide-react";

const quickReplies = ["Send loan link", "Ask income", "EMI details"];
const filters = ["All", "Unread", "Interested"];

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  sessionActive: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "customer" | "business";
  time: string;
}

export default function Inbox() {
  const [selectedId, setSelectedId] = useState("1");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [conversations, setConversations] = useState<Record<string, Message[]>>(mockConversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to normalize phone numbers for comparison
  const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

  // Helper function to find contact by phone number
  const findContactByPhone = (phone: string, contactsList: Contact[]) => {
    const normalized = normalizePhone(phone);
    return contactsList.find(
      (c) =>
        normalizePhone(c.phone).includes(normalized) || normalized.includes(normalizePhone(c.phone))
    );
  };

  // Listen for incoming messages from backend via Socket.io
  useEffect(() => {
    console.log("[Inbox] Setting up Socket.io listener");

    const handleNewMessage = (incomingData: any) => {
      console.log("[Inbox] New message received:", incomingData);

      // Extract message details
      const {
        phoneNumber,
        customerName = "Unknown",
        content,
        messageType = "text",
        timestamp = new Date().toLocaleTimeString(),
      } = incomingData;

      if (!phoneNumber) {
        console.warn("[Inbox] Message missing phone number");
        return;
      }

      // Update contacts list and conversations
      setContacts((prevContacts) => {
        const existingContact = findContactByPhone(phoneNumber, prevContacts);

        if (existingContact) {
          // Update existing contact's last message and unread count
          return prevContacts.map((c) =>
            c.id === existingContact.id
              ? {
                  ...c,
                  lastMessage: content,
                  lastMessageTime: "now",
                  unread: c.unread + 1,
                }
              : c
          );
        } else {
          // Create new contact
          const newContact: Contact = {
            id: `contact-${Date.now()}`,
            name: customerName,
            phone: phoneNumber,
            tags: [],
            lastMessage: content,
            lastMessageTime: "now",
            unread: 1,
            sessionActive: true,
          };
          return [newContact, ...prevContacts];
        }
      });

      // Add message to conversation
      setConversations((prevConversations) => {
        // Find contact to get its ID (search in current contacts state)
        const contactMatch = findContactByPhone(phoneNumber, contacts);
        const contactId = contactMatch ? contactMatch.id : `contact-${Date.now()}`;

        const existingMessages = prevConversations[contactId] || [];
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          text: content,
          sender: "customer",
          time: timestamp,
        };

        return {
          ...prevConversations,
          [contactId]: [...existingMessages, newMessage],
        };
      });
    };

    // Listen for new messages
    socket.on("new_message", handleNewMessage);

    // Cleanup listener on unmount
    return () => {
      socket.off("new_message", handleNewMessage);
      console.log("[Inbox] Socket.io listener removed");
    };
  }, [contacts]);

  const filtered = contacts.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
    if (filter === "Unread" && c.unread === 0) return false;
    if (filter === "Interested" && !c.tags.includes("Interested")) return false;
    return true;
  });

  const selected = contacts.find((c) => c.id === selectedId);
  const msgs = conversations[selectedId] || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  return (
    <AppLayout title="Inbox">
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Contact List */}
        <div className="w-[340px] shrink-0 border-r border-border bg-card flex flex-col">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex gap-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                  selectedId === c.id ? "bg-accent" : "hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">{c.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{c.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate pr-2">{c.lastMessage}</span>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-background">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="h-14 shrink-0 border-b border-border bg-card flex items-center justify-between px-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{selected.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        tag === "Hot" ? "bg-destructive/10 text-destructive"
                        : tag === "Interested" ? "bg-info/10 text-info"
                        : "bg-warning/10 text-warning-foreground"
                      }`}
                    >
                      {tag === "Hot" ? <Flame className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                      {tag}
                    </span>
                  ))}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      selected.sessionActive
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning-foreground"
                    }`}
                  >
                    {selected.sessionActive ? (
                      <><Clock className="w-3 h-3" /> 24h Active</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3" /> Session Expired</>
                    )}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
                {msgs.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "business" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === "business"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card card-shadow text-foreground rounded-bl-md"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === "business" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-5 py-2 flex gap-2">
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-accent transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-5 py-3 border-t border-border bg-card flex items-center gap-3">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 py-2.5 px-4 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <button className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a conversation to start
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
