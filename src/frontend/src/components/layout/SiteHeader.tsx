import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X, Eye, Users } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useGetSiteMetrics } from '@/hooks/useQueries';
import { useState } from 'react';
import { APPROVED_IMAGE_PATH } from '@/utils/approvedImage';

export default function SiteHeader() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: metrics, isLoading: metricsLoading, isError } = useGetSiteMetrics();

  // Safe display values with fallbacks
  const totalViews = metrics?.totalSiteViews ? Number(metrics.totalSiteViews).toLocaleString() : '0';
  const liveViewers = metrics?.currentLiveViewers ? Number(metrics.currentLiveViewers).toLocaleString() : '0';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        {/* Metrics Bar - Always visible for everyone */}
        <div className="flex items-center justify-center gap-6 py-2 border-b border-border/20">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-primary" />
            <span className="font-medium">Total Views:</span>
            <span className="text-muted-foreground">
              {metricsLoading ? '...' : isError ? '0' : totalViews}
            </span>
          </div>
          <div className="h-4 w-px bg-border/40" />
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-accent" />
            <span className="font-medium">Live Viewers:</span>
            <span className="text-muted-foreground">
              {metricsLoading ? '...' : isError ? '0' : liveViewers}
            </span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={APPROVED_IMAGE_PATH}
              alt="Why Not Us Logo" 
              className="h-10 w-10 object-cover rounded-lg"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">Why Not Us ?</span>
              <span className="text-xs text-muted-foreground">Transparent Giving</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link 
              to="/ledger" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Ledger
            </Link>
            <Link 
              to="/donors" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Donors
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate({ to: '/donate' })}
              className="hidden sm:flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Donate
            </Button>
            <LoginButton />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container py-4 flex flex-col gap-3">
            <Link 
              to="/" 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/ledger" 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ledger
            </Link>
            <Link 
              to="/donors" 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Donors
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-sm font-medium py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <Button 
              onClick={() => {
                navigate({ to: '/donate' });
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Donate
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
