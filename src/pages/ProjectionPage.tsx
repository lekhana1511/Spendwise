import React from 'react';
import { ProjectionCalculator } from '../components/projection/ProjectionCalculator';
import { TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

export const ProjectionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Wealth Generation Calculator
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Future-Value Wealth Projections
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          See what happens when you redirect discretionary expenses into disciplined compound interest investments.
        </p>
      </div>

      {/* Projection Calculator Component */}
      <ProjectionCalculator />
    </div>
  );
};
