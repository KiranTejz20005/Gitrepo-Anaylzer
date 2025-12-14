import React, { useState } from 'react';
import { Search, Github, AlertCircle, Settings, ChevronRight, Sparkles } from 'lucide-react';
import { GitHubUser, GitHubRepo, ProfileAnalysis, AnalysisState, ContributionStats } from './types';
import { fetchFullProfileData } from './services/githubService';
import { analyzeProfile } from './services/geminiService';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const [state, setState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<{
    user: GitHubUser;
    repos: GitHubRepo[];
    analysis: ProfileAnalysis;
    stats: ContributionStats;
  } | null>(null);

  const extractUsername = (input: string): string | null => {
    let clean = input.trim();
    if (clean.includes('github.com')) {
      try {
        const urlStr = clean.startsWith('http') ? clean : `https://${clean}`;
        const url = new URL(urlStr);
        const parts = url.pathname.split('/').filter(p => p);
        if (parts.length > 0) return parts[0];
      } catch (e) {
        console.warn("Error parsing URL:", e);
      }
    }
    const parts = clean.split('/').filter(p => p);
    if (parts.length > 0) return parts[0];
    return clean || null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const targetUser = extractUsername(username);
    if (!targetUser) {
      setError("Please enter a valid GitHub username or URL.");
      return;
    }

    setState(AnalysisState.FETCHING_GITHUB);
    setError(null);

    try {
      const { user, repos, stats } = await fetchFullProfileData(targetUser, token || undefined);
      
      if (repos.length === 0) {
        throw new Error("This user has no public repositories to analyze.");
      }

      setState(AnalysisState.ANALYZING_GEMINI);

      const analysis = await analyzeProfile(user, repos);

      setData({ user, repos, analysis, stats });
      setState(AnalysisState.COMPLETE);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setState(AnalysisState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AnalysisState.IDLE);
    setData(null);
    setUsername('');
    setError(null);
  };

  if (state === AnalysisState.COMPLETE && data) {
    return (
      <AnalysisView 
        user={data.user} 
        repos={data.repos} 
        analysis={data.analysis} 
        stats={data.stats}
        onReset={handleReset} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-300">
      
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-xl w-full z-10 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
             <div className="p-5 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Github size={56} className="text-white relative z-10" />
             </div>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 tracking-tight mb-4">
            GitHub Analyzer
          </h1>
          <p className="text-lg text-slate-400 font-normal max-w-md mx-auto leading-relaxed">
            AI-powered insights for engineering portfolios.
          </p>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl transition-all hover:border-slate-600/50 hover:shadow-blue-900/10 hover:shadow-2xl">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-300 mb-2 ml-1">
                GitHub Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="username"
                  className="w-full pl-12 pr-4 py-4 bg-[#0f1420] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-lg group-hover:border-slate-600 font-medium"
                  placeholder="e.g. torvalds"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={state !== AnalysisState.IDLE && state !== AnalysisState.ERROR}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" size={20} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
                <button 
                    type="button" 
                    onClick={() => setShowTokenInput(!showTokenInput)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors self-end font-medium"
                >
                    <Settings size={12} />
                    {showTokenInput ? 'Hide Token' : 'Add Access Token (Optional)'}
                </button>
                
                {showTokenInput && (
                    <div className="animate-fade-in p-4 bg-[#0f1420] rounded-lg border border-slate-700/50">
                        <label className="block text-xs text-slate-400 mb-1">Personal Access Token</label>
                        <input 
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="ghp_..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-300 focus:border-blue-500 outline-none placeholder-slate-600"
                        />
                         <p className="text-[10px] text-slate-600 mt-2">Used only for this session to increase API rate limits.</p>
                    </div>
                )}
            </div>

            <button
              type="submit"
              disabled={!username || (state !== AnalysisState.IDLE && state !== AnalysisState.ERROR)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {state === AnalysisState.IDLE || state === AnalysisState.ERROR ? (
                <>
                  Generate Report <Sparkles size={20} className="text-yellow-300" />
                </>
              ) : (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {state === AnalysisState.FETCHING_GITHUB ? 'Retrieving Data...' : 'Analyzing Portfolio...'}
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 animate-fade-in">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;