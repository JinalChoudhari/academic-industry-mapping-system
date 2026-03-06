import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Info, X } from 'lucide-react';

export function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('welcome_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('welcome_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Alert className="mb-6 bg-primary/10 border-primary/20">
      <Info className="h-5 w-5" />
      <AlertTitle className="flex items-center justify-between">
        <span>Welcome to the Academic-Industry Mapping System</span>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          <strong>Quick Start Guide:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Go to <strong>Admin Panel</strong> and upload course and station Excel files</li>
          <li>Use <strong>Data Management</strong> to review and edit uploaded records</li>
          <li>Return to <strong>User Panel</strong> to search and see skill-based correlations</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
}

