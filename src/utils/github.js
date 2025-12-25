// GitHub API utility for fetching user data and activity

const GITHUB_API_BASE = 'https://api.github.com';

// Fetch user profile
export const fetchUserProfile = async (username) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub profile:', error);
    throw error;
  }
};

// Fetch user repositories
export const fetchUserRepos = async (username, page = 1, perPage = 30) => {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    throw error;
  }
};

// Fetch recent commits for a repository
export const fetchRepoCommits = async (username, repo, perPage = 10) => {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${username}/${repo}/commits?per_page=${perPage}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch commits');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
};

// Fetch user's recent events (activity)
export const fetchUserEvents = async (username, perPage = 30) => {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/events/public?per_page=${perPage}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get activity summary for the past week
export const getWeeklyActivitySummary = async (username) => {
  try {
    const events = await fetchUserEvents(username, 100);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEvents = events.filter(
      (event) => new Date(event.created_at) >= oneWeekAgo
    );

    const summary = {
      totalEvents: weeklyEvents.length,
      pushEvents: 0,
      pullRequests: 0,
      issues: 0,
      repos: new Set(),
      commits: [],
    };

    weeklyEvents.forEach((event) => {
      summary.repos.add(event.repo.name);

      switch (event.type) {
        case 'PushEvent':
          summary.pushEvents++;
          if (event.payload.commits) {
            summary.commits.push(
              ...event.payload.commits.map((c) => ({
                message: c.message,
                repo: event.repo.name,
                date: event.created_at,
              }))
            );
          }
          break;
        case 'PullRequestEvent':
          summary.pullRequests++;
          break;
        case 'IssuesEvent':
          summary.issues++;
          break;
      }
    });

    summary.repos = Array.from(summary.repos);
    return summary;
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    throw error;
  }
};

// Format repository data for display
export const formatRepoData = (repo) => {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || 'No description',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    openIssues: repo.open_issues_count,
    isPrivate: repo.private,
    url: repo.html_url,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    topics: repo.topics || [],
  };
};

// Get language color (for visualization)
export const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    PHP: '#4F5D95',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    React: '#61dafb',
    default: '#6b7280',
  };
  return colors[language] || colors.default;
};
