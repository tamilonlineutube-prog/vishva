import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SupabaseDiagnostics() {
  const [info, setInfo] = useState({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    anonKeyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    urlReachable: false,
    authServiceAvailable: false,
    testEmail: '',
    testError: '',
    testSuccess: false,
    loading: false,
  });

  useEffect(() => {
    const checkSupabase = async () => {
      // Check if URL is reachable
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        if (url) {
          const response = await fetch(`${url}/health`, { method: 'HEAD' });
          setInfo(prev => ({ ...prev, urlReachable: response.ok || response.status === 200 }));
        }
      } catch (error) {
        console.error('URL not reachable:', error);
        setInfo(prev => ({ ...prev, urlReachable: false }));
      }

      // Check auth service
      try {
        const { data } = await supabase.auth.getSession();
        setInfo(prev => ({ ...prev, authServiceAvailable: true }));
      } catch (error) {
        console.error('Auth service error:', error);
        setInfo(prev => ({ ...prev, authServiceAvailable: false, testError: (error as Error).message }));
      }
    };

    checkSupabase();
  }, []);

  const testSignUp = async () => {
    setInfo(prev => ({ ...prev, loading: true, testError: '', testSuccess: false }));
    
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          data: { full_name: 'Test User' },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setInfo(prev => ({ 
          ...prev, 
          loading: false, 
          testError: `Error: ${error.message}`,
          testEmail 
        }));
      } else {
        setInfo(prev => ({ 
          ...prev, 
          loading: false, 
          testSuccess: true,
          testEmail,
          testError: 'SignUp successful! Check your email for confirmation.'
        }));
      }
    } catch (err) {
      setInfo(prev => ({ 
        ...prev, 
        loading: false, 
        testError: `Network Error: ${(err as Error).message}` 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Diagnostics</h1>
        
        <div className="space-y-4">
          {/* Configuration */}
          <Card className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Configuration
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Supabase URL:</span>
                <p className="text-muted-foreground break-all">{info.supabaseUrl || 'NOT SET'}</p>
              </div>
              <div>
                <span className="font-medium">Anon Key:</span>
                <p className={info.anonKeyExists ? 'text-green-600' : 'text-red-600'}>
                  {info.anonKeyExists ? '✓ Set' : '✗ Missing'}
                </p>
              </div>
            </div>
          </Card>

          {/* Health Check */}
          <Card className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Health Check
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>URL Reachable:</span>
                <span className={info.urlReachable ? 'text-green-600' : 'text-red-600'}>
                  {info.urlReachable ? '✓ Reachable' : '✗ Not Reachable'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auth Service:</span>
                <span className={info.authServiceAvailable ? 'text-green-600' : 'text-red-600'}>
                  {info.authServiceAvailable ? '✓ Available' : '✗ Error'}
                </span>
              </div>
            </div>
          </Card>

          {/* Test SignUp */}
          <Card className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Test SignUp
            </h2>
            {info.testError && (
              <div className={`p-3 rounded-lg mb-3 text-sm ${info.testSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {info.testError}
                {info.testEmail && <p className="mt-1 font-mono text-xs">{info.testEmail}</p>}
              </div>
            )}
            <Button 
              onClick={testSignUp} 
              disabled={info.loading}
              className="w-full"
            >
              {info.loading ? 'Testing...' : 'Test SignUp'}
            </Button>
          </Card>

          {/* Troubleshooting */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h2 className="font-semibold mb-2">Troubleshooting Tips</h2>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Check that your Supabase project is active and not paused</li>
              <li>Verify the Supabase URL is correct (check dashboard → Settings → API)</li>
              <li>Verify the Anon Key is correct (starts with eyJ...)</li>
              <li>Make sure Email/Password auth is enabled in Supabase → Authentication → Providers</li>
              <li>Try disabling browser extensions that might block requests</li>
              <li>Check if your ISP/firewall blocks Supabase URLs</li>
              <li>Clear browser cache and cookies, then reload</li>
            </ul>
          </Card>

          {/* Debug Info */}
          <Card className="p-4 bg-gray-50">
            <h2 className="font-semibold mb-2 text-xs">Dev Info</h2>
            <pre className="text-xs overflow-auto bg-white p-2 rounded border">
{JSON.stringify({
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  env: import.meta.env.MODE,
}, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
