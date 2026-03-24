import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Loader2, Eye, EyeOff, Check, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) { setError(error); return; }
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-sm">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-7">
          {done ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1">Password updated</h2>
              <p className="text-sm text-muted-foreground mb-6">Your password has been reset successfully.</p>
              <Button asChild className="rounded-xl h-10">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirm" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 rounded-xl pr-10" />
                  {confirm.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-destructive" />}
                    </span>
                  )}
                </div>
                {passwordsMismatch && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl text-sm font-medium active:scale-[0.98] transition-transform" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
