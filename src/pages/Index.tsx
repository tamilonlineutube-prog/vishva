import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MessageCircle, Loader2, Check, X, Send, MessageSquare, BarChart3, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const features = [
  { icon: Send, text: "Send bulk WhatsApp campaigns" },
  { icon: MessageSquare, text: "Chat with customers in one inbox" },
  { icon: BarChart3, text: "Track performance and conversions" },
  { icon: Bot, text: "Ready for AI automation" },
];

function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error); return; }
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="h-11 rounded-xl pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember-landing" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
          <Label htmlFor="remember-landing" className="text-sm font-normal cursor-pointer">Remember me</Label>
        </div>
        <Link to="/forgot-password" className="text-sm text-primary hover:underline underline-offset-4">Forgot password?</Link>
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">Check your email</h2>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input id="signup-name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <div className="relative">
          <Input id="signup-confirm" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 rounded-xl pr-10" />
          {confirm.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {passwordsMatch ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-destructive" />}
            </span>
          )}
        </div>
        {passwordsMismatch && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
      </div>
      <Button type="submit" className="w-full h-11 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Marketing */}
      <div className="hidden lg:flex lg:w-[52%] bg-primary relative flex-col justify-center px-16 xl:px-24 py-16 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/[0.03]" />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-primary-foreground tracking-tight">WA Connect</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold text-primary-foreground leading-[1.15] mb-5" style={{ textWrap: "balance" }}>
            Manage WhatsApp conversations, campaigns, and customers — all in one place
          </h1>

          <p className="text-primary-foreground/70 text-base leading-relaxed mb-10 max-w-md">
            A powerful WhatsApp CRM to send campaigns, chat with customers, and convert leads faster.
          </p>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-primary-foreground/85 text-[15px]">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — Auth */}
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/40 px-4 py-12 lg:py-0">
        <div className="flex lg:hidden flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-sm">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">WA Connect</h1>
          <p className="text-sm text-muted-foreground mt-1">WhatsApp Business CRM</p>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-7">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full mb-6 h-11 rounded-xl bg-muted p-1">
                <TabsTrigger value="login" className="flex-1 rounded-lg text-sm font-medium data-[state=active]:shadow-sm">Sign in</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 rounded-lg text-sm font-medium data-[state=active]:shadow-sm">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Terms</a>{" "}
            &{" "}
            <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
