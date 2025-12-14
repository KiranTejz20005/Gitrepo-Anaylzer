import React from 'react';
import { Info } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  infoText?: string;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'md', label, infoText }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-green-500';
  if (score < 50) colorClass = 'text-red-500';
  else if (score < 75) colorClass = 'text-yellow-500';

  let sizeClass = 'w-32 h-32';
  let textSizeClass = 'text-3xl';
  let strokeWidth = "8";

  if (size === 'sm') {
    sizeClass = 'w-12 h-12';
    textSizeClass = 'text-xs font-bold';
    strokeWidth = "10"; // Thicker stroke visually for small size
  } else if (size === 'lg') {
    sizeClass = 'w-48 h-48';
    textSizeClass = 'text-5xl';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className={`relative ${sizeClass}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-slate-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
        <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${textSizeClass} font-bold text-white`}>
          {score}
        </div>
      </div>
      
      {label && (
        <div className="mt-2 flex items-center gap-1.5 cursor-help group relative">
          <span className="text-slate-400 text-sm uppercase tracking-wider">{label}</span>
          {infoText && (
            <div className="relative">
               <Info size={14} className="text-slate-500 hover:text-blue-400 transition-colors" />
               {/* Tooltip */}
               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-xs text-slate-300 rounded-lg border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                  {infoText}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreGauge;