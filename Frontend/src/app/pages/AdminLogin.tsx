import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Simple auth storage (localStorage)
const AUTH_KEY = 'admin_authenticated';
const AUTH_TIMESTAMP = 'admin_auth_timestamp';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Default credentials (in production, this would be server-side)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

export const checkAuth = (): boolean => {
  const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
  const timestamp = localStorage.getItem(AUTH_TIMESTAMP);
  
  if (!isAuth || !timestamp) return false;
  
  // Check if session is expired
  const elapsed = Date.now() - parseInt(timestamp);
  if (elapsed > SESSION_DURATION) {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP);
    return false;
  }
  
  return true;
};

export const setAuth = () => {
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(AUTH_TIMESTAMP, Date.now().toString());
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP);
};

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        setAuth();
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        setError('Invalid username or password');
        toast.error('Login failed');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Sign in to access the administration panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Default Credentials:</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Username: <code className="bg-background px-1 py-0.5 rounded">admin</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Password: <code className="bg-background px-1 py-0.5 rounded">admin123</code>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
