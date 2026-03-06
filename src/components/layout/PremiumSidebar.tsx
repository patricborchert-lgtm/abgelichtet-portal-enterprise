import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface PremiumSidebarProps {
  items: NavItem[];
}

export const PremiumSidebar: React.FC<PremiumSidebarProps> = ({ items }) => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200/60 bg-white/90 backdrop-blur">
      {/* Logo Header */}
      <div className="flex h-16 items-center border-b border-slate-100/70 px-6">
        <img 
          src="/logo_abgelichtet.ch_23.svg" 
          alt="Abgelichtet Portal" 
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </div>
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile / Footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-gradient-to-tr from-violet-100 to-violet-200 text-xs font-semibold text-violet-700">
            AP
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">Admin User</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? 'admin@abgelichtet.ch'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Example usage of SVG icons (placeholders)
export const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);
