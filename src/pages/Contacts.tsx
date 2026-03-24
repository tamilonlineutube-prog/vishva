import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { contacts } from "@/lib/mockData";
import { Search, Flame, Star, Clock } from "lucide-react";

const tagColors: Record<string, string> = {
  Hot: "bg-destructive/10 text-destructive",
  Interested: "bg-info/10 text-info",
  "Follow-up": "bg-warning/10 text-warning-foreground",
};
const tagIcons: Record<string, typeof Flame> = {
  Hot: Flame,
  Interested: Star,
  "Follow-up": Clock,
};

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");

  const allTags = ["All", "Hot", "Interested", "Follow-up"];

  const filtered = contacts.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
    if (tagFilter !== "All" && !c.tags.includes(tagFilter)) return false;
    return true;
  });

  return (
    <AppLayout title="Contacts">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex gap-1">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  tagFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl card-shadow animate-fade-in" style={{ animationDelay: "100ms" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Message</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{c.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground tabular-nums">{c.phone}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex gap-1">
                      {c.tags.length > 0 ? c.tags.map((tag) => {
                        const Icon = tagIcons[tag] || Star;
                        return (
                          <span key={tag} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${tagColors[tag] || "bg-secondary text-secondary-foreground"}`}>
                            <Icon className="w-3 h-3" />{tag}
                          </span>
                        );
                      }) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground truncate max-w-[200px]">{c.lastMessage}</td>
                  <td className="px-6 py-3.5 text-right text-muted-foreground text-xs">{c.lastMessageTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
