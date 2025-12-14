import { GitHubUser, GitHubRepo, ContributionStats } from '../types';

const BASE_URL = 'https://api.github.com';

// Helper to handle rate limits and errors
async function fetchGitHub<T>(url: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub API rate limit exceeded. Please try again later or provide a token.");
    }
    if (response.status === 404) {
      throw new Error("User or resource not found.");
    }
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return response.json();
}

// Fetch contribution data from a public unofficial API to calculate streaks
// This avoids heavy scraping on the client side.
async function fetchContributionStats(username: string): Promise<ContributionStats> {
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
    if (!response.ok) {
        // Fallback if the external API fails
        return { totalContributions: 0, longestStreak: 0, currentStreak: 0 };
    }
    
    const data = await response.json();
    
    // Calculate Total (Current Year + Past Years if available, but usually the API returns a 'total' object keyed by year)
    // The API structure is: { total: { "2024": 100, ... }, contributions: [...] }
    const total = Object.values(data.total as Record<string, number>).reduce((acc, curr) => acc + curr, 0);

    // Calculate Streak
    // contributions is an array of { date: "YYYY-MM-DD", count: number, level: number }
    const contributions = data.contributions as Array<{ date: string, count: number }>;
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort just in case, though API usually sends sorted
    contributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    contributions.forEach(day => {
        if (day.count > 0) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
        }
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current Streak (check from end of array backwards)
    // We need to handle 'today' potentially having 0 if the day just started, 
    // but strict definition means 0 breaks the streak.
    const today = new Date().toISOString().split('T')[0];
    const lastDay = contributions[contributions.length - 1];
    
    // Simple current streak logic working backwards
    let activeStreak = 0;
    for (let i = contributions.length - 1; i >= 0; i--) {
        if (contributions[i].count > 0) {
            activeStreak++;
        } else {
            // If it's today and 0, we don't break yet if we look at yesterday? 
            // Standard GitHub streak logic is strict. 0 today means 0 streak unless we committed today.
            // But often people want to see the streak leading up to today.
            // If today is 0, and yesterday > 0, streak is 0? 
            // Let's stick to strict: if 0, stop, unless it is today and we assume the user might push later.
            // For simplicity: strict.
            if (contributions[i].date === today) continue; 
            break;
        }
    }

    return {
        totalContributions: total,
        longestStreak: longestStreak,
        currentStreak: activeStreak
    };

  } catch (e) {
      console.warn("Failed to fetch contribution stats", e);
      return { totalContributions: 0, longestStreak: 0, currentStreak: 0 };
  }
}

export const getUserProfile = async (username: string, token?: string): Promise<GitHubUser> => {
  return fetchGitHub<GitHubUser>(`${BASE_URL}/users/${username}`, token);
};

export const getUserRepos = async (username: string, token?: string): Promise<GitHubRepo[]> => {
  // Fetch most recently updated repos first
  return fetchGitHub<GitHubRepo[]>(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=6&type=owner`, token);
};

export const getRepoReadme = async (owner: string, repo: string, token?: string): Promise<string | null> => {
  try {
    const data = await fetchGitHub<{ content: string; encoding: string }>(
      `${BASE_URL}/repos/${owner}/${repo}/readme`,
      token
    );
    // Content is base64 encoded
    if (data.encoding === 'base64' && data.content) {
        return atob(data.content.replace(/\n/g, '')).slice(0, 2000); // Limit to 2000 chars to save tokens
    }
    return null;
  } catch (error) {
    // 404 means no readme, or other error. We just return null.
    return null;
  }
};

export const fetchFullProfileData = async (username: string, token?: string) => {
  const user = await getUserProfile(username, token);
  
  // Parallel fetch: Repos and Stats
  const [repos, stats] = await Promise.all([
    getUserRepos(username, token),
    fetchContributionStats(username)
  ]);

  // Parallel fetch readmes for the top 3 repos to give Gemini more context
  const reposWithReadmes = await Promise.all(
    repos.map(async (repo, index) => {
      if (index < 3) {
        const readme = await getRepoReadme(user.login, repo.name, token);
        return { ...repo, readmeContent: readme };
      }
      return repo;
    })
  );

  return { user, repos: reposWithReadmes, stats };
};
