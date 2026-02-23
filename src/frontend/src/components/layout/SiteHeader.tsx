import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X, Eye, Users } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useGetSiteMetrics } from '@/hooks/useQueries';
import { useState } from 'react';
import { SITE_LOGO_PATH } from '@/utils/siteBranding';

export default function SiteHeader() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: metrics, isLoading: metricsLoading, isError } = useGetSiteMetrics();

  // Safe display values with fallbacks
  const totalViews = metrics?.totalSiteViews ? Number(metrics.totalSiteViews).toLocaleString() : '0';
  const liveViewers = metrics?.currentLiveViewers ? Number(metrics.currentLiveViewers).toLocaleString() : '0';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Live Metrics Bar */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">
                {metricsLoading ? '...' : isError ? 'N/A' : totalViews}
              </span>
              <span className="text-muted-foreground">Total Views</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-green-600" />
              <span className="font-medium text-foreground">
                {metricsLoading ? '...' : isError ? 'N/A' : liveViewers}
              </span>
              <span className="text-muted-foreground">Live Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              <img 
                src={SITE_LOGO_PATH} 
                alt="Why Not Us Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">Why Not Us ?</span>
              <span className="text-xs text-muted-foreground">Transparent Trust Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ledger">Ledger</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/donors">Donors</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/services">Services</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about">About Us</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
            {isAdmin && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/domain-setup">Domain Setup</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button size="sm" asChild>
              <Link to="/donate">Donate Now</Link>
            </Button>
            <LoginButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/ledger" onClick={() => setMobileMenuOpen(false)}>Ledger</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/donors" onClick={() => setMobileMenuOpen(false)}>Donors</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              </Button>
              {isAdmin && (
                <>
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/admin/domain-setup" onClick={() => setMobileMenuOpen(false)}>Domain Setup</Link>
                  </Button>
                </>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t mt-2">
                <Button size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/donate">Donate Now</Link>
                </Button>
                <LoginButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
