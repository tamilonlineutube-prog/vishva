import { ReactNode } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  FileText,
  Users,
  Settings,
  MessageCircle,
  LogOut,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inbox", url: "/inbox", icon: MessageSquare },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageCircle className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">WA Connect</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeClassName="bg-accent text-accent-foreground"
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive w-full active:scale-[0.97]"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-border bg-card flex items-center px-6">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
