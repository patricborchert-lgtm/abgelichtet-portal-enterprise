import React from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  href?: string;
}

interface PremiumSidebarProps {
  items: NavItem[];
}

export const PremiumSidebar: React.FC<PremiumSidebarProps> = ({ items }) => {
  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200/60 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100/50">
        <img 
          src="/logo_abgelichtet.ch_23.svg" 
          alt="Abgelichtet Portal" 
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href || '#'}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${item.active 
                ? 'bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200/50' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }
            `}
          >
            <span className={`
              transition-colors duration-200
              ${item.active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}
            `}>
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-100 to-violet-200 flex items-center justify-center text-violet-700 font-semibold text-xs border border-violet-200">
            AP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@abgelichtet.ch</p>
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
