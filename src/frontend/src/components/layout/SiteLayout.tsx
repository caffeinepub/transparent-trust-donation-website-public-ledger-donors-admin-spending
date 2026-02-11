import { Outlet } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { useIncrementSiteViews, useViewerConnected, useViewerDisconnected } from '@/hooks/useQueries';

export default function SiteLayout() {
  const incrementViews = useIncrementSiteViews();
  const viewerConnected = useViewerConnected();
  const viewerDisconnected = useViewerDisconnected();
  const hasRegistered = useRef(false);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Register viewer session on mount
    if (!hasRegistered.current) {
      hasRegistered.current = true;
      
      // Increment total views
      incrementViews.mutate();
      
      // Register as live viewer
      viewerConnected.mutate();

      // Set up heartbeat to maintain live viewer status (every 30 seconds)
      heartbeatInterval.current = setInterval(() => {
        viewerConnected.mutate();
      }, 30000);
    }

    // Cleanup on unmount
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      viewerDisconnected.mutate();
    };
  }, []);

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
