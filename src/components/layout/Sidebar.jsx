import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Wrench,
  Layers,
  Lightbulb,
  MessageSquareQuote,
  CreditCard,
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../context/AuthContext';
import brandLogo from '../../assets/images/logo.png';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/profile', label: 'Profile', icon: User, countKey: 'profile' },
  { path: '/projects', label: 'Projects', icon: FolderGit2 },
  { path: '/experience', label: 'Experience', icon: Briefcase },
  { path: '/education', label: 'Education', icon: GraduationCap },
  { path: '/skills', label: 'Skills', icon: Wrench },
  { path: '/services', label: 'Services', icon: Layers },
  { path: '/solutions', label: 'Solutions', icon: Lightbulb },
  { path: '/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { path: '/pricing', label: 'Pricing', icon: CreditCard },
  { path: '/site-config', label: 'Site Config', icon: Settings },
  { path: '/terminal', label: 'Terminal', icon: Terminal },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { is2FAVerified, user } = useAuth();

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col justify-between transition-all duration-200 z-20 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className={`h-14 border-b border-border flex items-center ${sidebarCollapsed ? 'justify-center gap-1 px-1.5' : 'justify-between px-4'}`}>
          <div className="flex min-w-0 items-center gap-2">
            <img src={brandLogo} alt="" className="h-6 w-6 shrink-0 object-contain" />
            {!sidebarCollapsed && (
              <span className="truncate text-sm font-bold tracking-wider text-foreground uppercase">Ego Studio</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${sidebarCollapsed ? '' : 'ml-auto'}`}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Security Status Footer */}
      <div className="p-3 border-t border-border">
        <div
          className={`flex items-center gap-2 p-2 rounded text-[11px] ${
            is2FAVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {is2FAVerified ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
          {!sidebarCollapsed && (
            <div className="truncate">
              <p className="font-semibold">{is2FAVerified ? '2FA Verified' : 'Read-Only Mode'}</p>
              <p className="text-[10px] opacity-80 truncate">{user?.email || 'Public Session'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
