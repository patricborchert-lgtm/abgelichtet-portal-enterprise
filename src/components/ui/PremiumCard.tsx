import React from 'react';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '', title, subtitle, ...props }) => {
  return (
    <div className={`premium-card flex flex-col ${className}`} {...props}>
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
