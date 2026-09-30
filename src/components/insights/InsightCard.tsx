import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SmartInsight } from '../../services/insightService';
import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface InsightCardProps {
  insight: SmartInsight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const navigate = useNavigate();

  const severityConfigs = {
    info: {
      border: 'border-blue-200/80 bg-white',
      badge: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: <Info className="w-4 h-4 text-blue-600" />
    },
    warning: {
      border: 'border-amber-200/80 bg-white',
      badge: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
    },
    alert: {
      border: 'border-rose-200/80 bg-white',
      badge: 'text-rose-800 bg-rose-50 border-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />
    },
    success: {
      border: 'border-emerald-200/80 bg-white',
      badge: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    }
  };

  const config = severityConfigs[insight.severity] || severityConfigs.info;

  return (
    <div className={`p-5 rounded-2xl border shadow-2xs flex flex-col justify-between ${config.border}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {config.icon}
            <span className="text-xs font-semibold text-slate-700 capitalize">
              {insight.type.replace('_', ' ')}
            </span>
          </div>
          {insight.supportingValue && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border font-mono ${config.badge}`}>
              {insight.supportingValue}
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-slate-900 leading-snug">{insight.title}</h4>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{insight.message}</p>
      </div>

      {insight.actionLabel && (
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => navigate(insight.actionRoute || '/analytics')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>{insight.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
