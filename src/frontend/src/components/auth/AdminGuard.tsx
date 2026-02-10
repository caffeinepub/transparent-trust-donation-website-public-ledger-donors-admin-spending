import { ReactNode } from 'react';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import AccessDeniedScreen from '../feedback/AccessDeniedScreen';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity } = useInternetIdentity();
  const { isAdmin, isLoading } = useAdminStatus();

  if (!identity) {
    return <AccessDeniedScreen message="Please log in to access admin features." />;
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
