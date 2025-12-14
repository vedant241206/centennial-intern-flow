import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showLogout?: boolean;
  onLogout?: () => void;
}

const Header = ({ showLogout = false, onLogout }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg">
            CI
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            Centennial Infotech
          </h1>
        </div>
        
        {showLogout && onLogout && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
