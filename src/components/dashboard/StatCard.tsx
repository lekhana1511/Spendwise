import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface StatCardProps {
  label: string;
  amount: number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'positive' | 'neutral' | 'warning' | 'negative';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  amount,
  subtitle,
  icon: Icon,
  badge,
  onClick
}) => {
  const badgeStyles = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200/60',
    negative: 'text-rose-700 bg-rose-50 border-rose-200/60'
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight" data-tabular>
          {formatINR(amount)}
        </h3>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded border font-mono ${
              badgeStyles[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
