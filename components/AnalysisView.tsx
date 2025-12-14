import React, { useMemo, useState } from 'react';
import { GitHubUser, GitHubRepo, ProfileAnalysis, ContributionStats } from '../types';
import ScoreGauge from './ScoreGauge';
import RepoCard from './RepoCard';
import ChatWidget from './ChatWidget';
import { MapPin, Link as LinkIcon, Users, Calendar, Award, GitCommit, Flame, BookMarked, Code, Hash, TrendingUp, Briefcase, Github, ArrowLeft, Filter, ArrowUpDown, Quote } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface AnalysisViewProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  analysis: ProfileAnalysis;
  stats?: ContributionStats;
  onReset: () => void;
}

// Language Colors
const COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3776ab',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#ffac45',
  Vue: '#41b883',
  React: '#61dafb',
  Dart: '#00B4AB',
  Shell: '#89e051',
  C: '#555555',
  'C#': '#178600'
};

const DEFAULT_COLOR = '#94a3b8';

const AnalysisView: React.FC<AnalysisViewProps> = ({ user, repos, analysis, stats, onReset }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('score');
  
  // Calculate Language Distribution
  const languageData = useMemo(() => {
    const counts: Record<string, number> = {};
    repos.forEach(repo => {
        if (repo.language) {
            counts[repo.language] = (counts[repo.language] || 0) + 1;
        }
    });
    
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5
  }, [repos]);

  // Extract unique languages for filter
  const languages = useMemo(() => {
      const langs = new Set<string>();
      analysis.repoAnalyses.forEach(ra => {
          const r = repos.find(repo => repo.name === ra.name);
          if (r?.language) langs.add(r.language);
      });
      return ['All', ...Array.from(langs).sort()];
  }, [analysis.repoAnalyses, repos]);

  // Filter and Sort Repos
  const filteredRepos = useMemo(() => {
    let items = analysis.repoAnalyses.map(ra => {
        const r = repos.find(repo => repo.name === ra.name);
        return { analysis: ra, repo: r };
    });

    // Filter
    if (selectedLanguage !== 'All') {
        items = items.filter(item => item.repo?.language === selectedLanguage);
    }

    // Sort
    return items.sort((a, b) => {
        switch (sortOption) {
            case 'stars':
                return (b.repo?.stargazers_count || 0) - (a.repo?.stargazers_count || 0);
            case 'forks':
                return (b.repo?.forks_count || 0) - (a.repo?.forks_count || 0);
            case 'updated':
                return new Date(b.repo?.updated_at || 0).getTime() - new Date(a.repo?.updated_at || 0).getTime();
            case 'score':
            default:
                return b.analysis.score - a.analysis.score;
        }
    });
  }, [analysis.repoAnalyses, repos, selectedLanguage, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in font-sans text-slate-300">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row gap-10 items-start md:items-center justify-between border-b border-slate-800/60 pb-10">
        <div className="flex items-start gap-8">
            <div className="relative group">
                <img 
                    src={user.avatar_url} 
                    alt={user.login} 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-slate-700/50 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-3 -right-3 bg-[#0b0f19] p-2 rounded-xl border border-slate-700 shadow-lg">
                    <Github size={20} className="text-white" />
                </div>
            </div>
            <div className="pt-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight leading-none">{user.name || user.login}</h1>
                
                {/* Professional Persona Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg mb-5">
                   <Briefcase size={14} className="text-blue-400" />
                   <span className="text-blue-100 font-semibold text-sm tracking-wide">{analysis.professionalPersona}</span>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-400">
                     <span className="flex items-center gap-2 hover:text-white transition-colors">
                        <span className="font-mono text-slate-500">@</span>{user.login}
                     </span>
                     {user.location && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                            <MapPin size={14} /> {user.location}
                        </a>
                     )}
                     {user.blog && (
                        <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                            <LinkIcon size={14} /> Website
                        </a>
                     )}
                     <span className="flex items-center gap-2">
                        <Users size={14} /> {user.followers} Followers
                     </span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl w-full md:w-auto justify-between md:justify-end backdrop-blur-sm">
            <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Portfolio Score</div>
                <div className="text-5xl font-bold text-white tracking-tighter tabular-nums">{analysis.profileScore}</div>
            </div>
            <div className="w-20 h-20">
                 <ScoreGauge score={analysis.profileScore} size="sm" />
            </div>
        </div>
      </header>


      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-[#0f1420] border border-slate-800 p-6 rounded-2xl flex flex-col items-start justify-center hover:border-slate-700 transition-colors group">
              <div className="mb-4 p-2.5 bg-blue-500/5 rounded-lg text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                  <BookMarked size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight font-mono tabular-nums">{user.public_repos}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Repositories</div>
          </div>
          
          <div className="bg-[#0f1420] border border-slate-800 p-6 rounded-2xl flex flex-col items-start justify-center hover:border-slate-700 transition-colors group">
              <div className="mb-4 p-2.5 bg-green-500/5 rounded-lg text-green-400 group-hover:bg-green-500/10 transition-colors">
                  <GitCommit size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight font-mono tabular-nums">{stats ? stats.totalContributions.toLocaleString() : '-'}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Contributions (Year)</div>
          </div>

          <div className="bg-[#0f1420] border border-slate-800 p-6 rounded-2xl flex flex-col items-start justify-center hover:border-slate-700 transition-colors group">
              <div className="mb-4 p-2.5 bg-orange-500/5 rounded-lg text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                  <Flame size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight font-mono tabular-nums">{stats ? `${stats.longestStreak}` : '-'}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Max Streak (Days)</div>
          </div>

          <div className="bg-[#0f1420] border border-slate-800 p-6 rounded-2xl flex flex-col items-start justify-center hover:border-slate-700 transition-colors group">
               <div className="mb-4 p-2.5 bg-purple-500/5 rounded-lg text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                  <TrendingUp size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight font-mono tabular-nums">{stats ? `${stats.currentStreak}` : '-'}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Current Streak</div>
          </div>
      </div>


      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Insights & Skills (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Professional Summary */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                        <Briefcase size={18} />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Executive Summary</h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg font-normal">
                    {analysis.profileSummary}
                </p>
            </section>

             {/* Career Advice & Verdict */}
             <section className="bg-gradient-to-b from-[#0f1420] to-slate-900 border border-slate-800 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Award size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Strategic Growth Advice</h3>
                    </div>
                    
                    <p className="text-slate-300 leading-relaxed text-lg font-normal mb-8">
                        {analysis.careerAdvice}
                    </p>

                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 flex items-start gap-4">
                        <Quote className="text-slate-600 flex-shrink-0" size={24} />
                        <div>
                             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Final Verdict</div>
                             <div className="text-xl md:text-2xl font-medium text-white italic leading-relaxed tracking-tight">"{analysis.overallImpression}"</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Repositories */}
            <section className="pt-4">
                 <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Key Projects</h2>
                        <p className="text-slate-500 text-sm mt-1">Deep dive analysis of top repositories</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Language Filter */}
                        <div className="relative flex-1 md:flex-initial">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="w-full appearance-none bg-[#0f1420] border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors cursor-pointer shadow-sm"
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <Filter size={12} />
                            </div>
                        </div>

                        {/* Sort Control */}
                        <div className="relative flex-1 md:flex-initial">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="w-full appearance-none bg-[#0f1420] border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors cursor-pointer shadow-sm"
                            >
                                <option value="score">Sort: Relevance (Score)</option>
                                <option value="stars">Sort: Stars</option>
                                <option value="forks">Sort: Forks</option>
                                <option value="updated">Sort: Recently Updated</option>
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <ArrowUpDown size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredRepos.length > 0 ? (
                        filteredRepos.map((item, index) => {
                             const { analysis: repoAnalysis, repo: originalRepo } = item;
                            return (
                                <RepoCard 
                                    key={index}
                                    analysis={repoAnalysis}
                                    repoUrl={originalRepo?.html_url || '#'}
                                    description={originalRepo?.description || null}
                                    language={originalRepo?.language || null}
                                    languageColor={COLORS[originalRepo?.language || ''] || DEFAULT_COLOR}
                                    topics={originalRepo?.topics}
                                    updatedAt={originalRepo?.updated_at}
                                />
                            );
                        })
                    ) : (
                         <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl border-dashed">
                            <p className="text-slate-500">No repositories match the selected filter.</p>
                         </div>
                    )}
                </div>
            </section>
        </div>


        {/* RIGHT COLUMN: Charts & Tech (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Bio Box */}
             <div className="bg-[#0f1420] border border-slate-800 rounded-2xl p-6 shadow-sm">
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">About</h3>
                 <p className="text-slate-300 italic text-sm leading-relaxed">"{user.bio || "No bio provided."}"</p>
             </div>

            {/* Inferred Skills */}
            <div className="bg-[#0f1420] border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Hash size={12} /> Core Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                    {analysis.technicalSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-md hover:bg-slate-700 hover:text-white transition-colors cursor-default">
                            {skill}
                        </span>
                    ))}
                    {analysis.technicalSkills.length === 0 && (
                        <span className="text-slate-500 text-sm italic">No specific skills inferred.</span>
                    )}
                </div>
            </div>

            {/* Tech Stack Chart */}
            <div className="bg-[#0f1420] border border-slate-800 rounded-2xl p-6 h-80 flex flex-col shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Code size={12} /> Language Composition
                </h3>
                
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={languageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {languageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || DEFAULT_COLOR} strokeWidth={0} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#f8fafc' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
      </div>

      <div className="flex justify-center pt-16 pb-8">
          <button 
            onClick={onReset}
            className="group flex items-center gap-2 px-8 py-3 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-xl transition-all text-sm shadow-xl shadow-white/5"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Analyze Another Profile
          </button>
      </div>

      {/* CHATBOT WIDGET */}
      <ChatWidget user={user} analysis={analysis} />

    </div>
  );
};

export default AnalysisView;