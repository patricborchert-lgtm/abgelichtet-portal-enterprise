import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`premium-card flex flex-col ${className}`}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
};
