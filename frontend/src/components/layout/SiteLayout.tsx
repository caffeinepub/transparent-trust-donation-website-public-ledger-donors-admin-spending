import { Outlet } from '@tanstack/react-router';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import AuthGate from '../auth/AuthGate';
import { useViewTracking, useLiveViewerSession } from '@/hooks/useViewTracking';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';

export default function SiteLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const hasProfile = userProfile !== null;
  const showContent = isAuthenticated && hasProfile;

  // Register view and live viewer session with resilient retry logic (only when authenticated)
  useViewTracking();
  useLiveViewerSession();

  // If not authenticated, show auth gate
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  // If authenticated but no profile and profile check is complete, show profile setup modal
  // Content is blocked until profile is complete
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && !hasProfile;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {showContent ? <Outlet /> : <div className="container py-12 text-center text-muted-foreground">Loading your profile...</div>}
      </main>
      <SiteFooter />
      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}
