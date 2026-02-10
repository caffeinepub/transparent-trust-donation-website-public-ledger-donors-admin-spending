import { Outlet } from '@tanstack/react-router';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ProfileSetupModal from '../auth/ProfileSetupModal';

export default function SiteLayout() {
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
