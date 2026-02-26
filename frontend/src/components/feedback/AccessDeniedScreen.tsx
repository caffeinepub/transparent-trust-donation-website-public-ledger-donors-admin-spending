import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface AccessDeniedScreenProps {
  message?: string;
}

export default function AccessDeniedScreen({ 
  message = "You don't have permission to access this page." 
}: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button onClick={() => navigate({ to: '/' })}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
