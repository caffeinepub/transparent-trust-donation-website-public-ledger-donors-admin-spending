import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Shield, LayoutDashboard, DollarSign, TrendingUp, Home, Menu, X } from 'lucide-react';
import AdminGuard from '../auth/AdminGuard';
import LoginButton from '../auth/LoginButton';
import AdminNotifications from '../admin/AdminNotifications';
import { useState } from 'react';

export default function AdminLayout() {
  return (
    <AdminGuard>
      <AdminLayoutContent />
    </AdminGuard>
  );
}

function AdminLayoutContent() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">Admin Portal</span>
                <span className="text-xs text-muted-foreground">Why Not Us ? Management</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/admin" 
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/admin/donations" 
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Donations
              </Link>
              <Link 
                to="/admin/spending" 
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Spending
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <AdminNotifications />
              <Button 
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="hidden sm:flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Public Site
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
                to="/admin" 
                className="text-sm font-medium py-2 hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                to="/admin/donations" 
                className="text-sm font-medium py-2 hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                Donations
              </Link>
              <Link 
                to="/admin/spending" 
                className="text-sm font-medium py-2 hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <DollarSign className="h-4 w-4" />
                Spending
              </Link>
              <Button 
                variant="outline"
                onClick={() => {
                  navigate({ to: '/' });
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Public Site
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Admin Portal © {new Date().getFullYear()} Why Not Us ?
            </p>
            <p className="text-xs text-muted-foreground">
              All actions affect public transparency data
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
