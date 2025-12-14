import React from 'react';
import { RepoAnalysis } from '../types';
import { ExternalLink, CheckCircle, XCircle, Lightbulb, Calendar, Tag, GitFork } from 'lucide-react';
import ScoreGauge from './ScoreGauge';

interface RepoCardProps {
  analysis: RepoAnalysis;
  repoUrl: string;
  description: string | null;
  language: string | null;
  languageColor?: string;
  topics?: string[];
  updatedAt?: string;
}

const timeAgo = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  return "today";
};

const RepoCard: React.FC<RepoCardProps> = ({ 
  analysis, 
  repoUrl, 
  description, 
  language,
  languageColor = '#94a3b8',
  topics = [],
  updatedAt 
}) => {
  return (
    <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300 flex flex-col h-full group shadow-sm hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1 pr-4">
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h3 className="text-xl font-bold text-white hover:text-blue-400 transition-colors tracking-tight">
              <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                {analysis.name} <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </h3>
            
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-bold tracking-wide uppercase ${
                analysis.completeness === 'High' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                analysis.completeness === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {analysis.completeness} Completeness
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs mb-3 text-slate-400 font-medium">
                {language && (
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: languageColor }}></span>
                    {language}
                </span>
                )}
                
                {updatedAt && (
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        Updated {timeAgo(updatedAt)}
                    </span>
                )}
            </div>

          <p className="text-slate-300 text-sm line-clamp-2 font-normal leading-relaxed mb-4">
            {description || "No description provided."}
          </p>
          
          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
                {topics.slice(0, 4).map(topic => (
                    <span key={topic} className="text-[10px] px-2 py-1 bg-slate-900/50 border border-slate-700 rounded-md text-slate-400 flex items-center gap-1">
                        <Tag size={10} /> {topic}
                    </span>
                ))}
            </div>
          )}

          <div className="bg-[#0f1420] p-3 rounded-lg border border-slate-700/50 text-slate-300 text-sm leading-relaxed">
             <span className="text-blue-400 font-bold text-xs uppercase tracking-wide mr-2">Summary</span>
             {analysis.summary}
          </div>
        </div>
        <div className="flex-shrink-0 pt-1">
          <ScoreGauge 
            score={analysis.score} 
            size="sm" 
            label="Rating"
            infoText="Automated scoring based on documentation, activity, and clarity." 
          />
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto pt-5 border-t border-slate-700/50">
        
        {/* Strengths */}
        <div className="space-y-3">
           <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1.5 opacity-90">
             <CheckCircle size={12} /> Strengths
           </h4>
           <ul className="space-y-2">
              {analysis.strengths.length > 0 ? analysis.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 leading-snug pl-2 border-l-2 border-slate-700">
                      {s}
                  </li>
              )) : <li className="text-xs text-slate-600 italic">None detected.</li>}
           </ul>
        </div>

        {/* Weaknesses */}
        <div className="space-y-3">
           <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5 opacity-90">
             <XCircle size={12} /> Weaknesses
           </h4>
           <ul className="space-y-2">
              {analysis.weaknesses.length > 0 ? analysis.weaknesses.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 leading-snug pl-2 border-l-2 border-slate-700">
                      {s}
                  </li>
              )) : <li className="text-xs text-slate-600 italic">None detected.</li>}
           </ul>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
           <h4 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5 opacity-90">
             <Lightbulb size={12} /> Suggestions
           </h4>
           <ul className="space-y-2">
              {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-slate-400 leading-snug pl-2 border-l-2 border-slate-700">
                      {s}
                  </li>
              ))}
           </ul>
        </div>

      </div>
    </div>
  );
};

export default RepoCard;