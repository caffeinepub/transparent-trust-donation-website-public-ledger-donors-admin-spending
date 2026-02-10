import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useState } from 'react';

export default function SiteHeader() {
  const navigate = useNavigate();
  const { isAdmin } = useAdminStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/assets/generated/trust-logo.dim_512x512.png" 
            alt="Trust Logo" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">Hope Trust</span>
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
              to="/admin/spending" 
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
                to="/admin/spending" 
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
