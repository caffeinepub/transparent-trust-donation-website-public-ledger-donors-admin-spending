import { Outlet } from '@tanstack/react-router';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { useViewTracking, useLiveViewerSession } from '@/hooks/useViewTracking';

export default function SiteLayout() {
  // Register view and live viewer session with resilient retry logic
  useViewTracking();
  useLiveViewerSession();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ProfileSetupModal />
    </div>
  );
}
