import React from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, ShieldCheck, ShieldAlert, LogOut, Lock } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useUIStore();
  const { is2FAVerified, logout } = useAuth();

  const getBreadcrumb = () => {
    const path = location.pathname.replace('/', '');
    if (!path) return 'Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between z-10 shrink-0">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Ego Studio</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-semibold text-foreground uppercase tracking-wider">{getBreadcrumb()}</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Mutation Access Indicator */}
        <div
          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1.5 border ${
            is2FAVerified
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {is2FAVerified ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MUTATION_AUTHORIZED</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>MUTATION_LOCKED (2FA REQUIRED)</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Logout Action */}
        {is2FAVerified && (
          <button
            onClick={logout}
            aria-label="Log out"
            className="p-1.5 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
            title="Log out & clear 2FA"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
