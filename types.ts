export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  blog: string | null;
  company: string | null;
  location: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  topics: string[];
  readmeContent?: string | null;
}

export interface ContributionStats {
  totalContributions: number;
  longestStreak: number;
  currentStreak: number;
}

export interface RepoAnalysis {
  name: string;
  score: number;
  completeness: 'Low' | 'Medium' | 'High';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface ProfileAnalysis {
  profileScore: number;
  professionalPersona: string; // e.g. "Senior Frontend Engineer", "Open Source Contributor"
  profileSummary: string;
  technicalSkills: string[]; // e.g. ["React", "Node.js", "System Design"]
  overallImpression: string;
  careerAdvice: string; // Replaced improvementAdvice with careerAdvice
  repoAnalyses: RepoAnalysis[];
}

export enum AnalysisState {
  IDLE = 'IDLE',
  FETCHING_GITHUB = 'FETCHING_GITHUB',
  ANALYZING_GEMINI = 'ANALYZING_GEMINI',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
