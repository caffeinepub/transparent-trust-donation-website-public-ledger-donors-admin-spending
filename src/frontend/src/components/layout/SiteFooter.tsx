import { Heart } from 'lucide-react';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'hope-trust');

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© {currentYear} Hope Trust. All rights reserved.</p>
            <p className="mt-1">Empowering communities through transparent giving.</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>using</span>
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
