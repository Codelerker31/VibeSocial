export function validateGitHubUrl(url: string): boolean {
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
  const gitlabRegex = /^https?:\/\/(www\.)?gitlab\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url) || gitlabRegex.test(url);
}

export async function fetchRepoInfo(url: string) {
  if (!validateGitHubUrl(url)) return null;

  // Extract owner and repo
  const parts = url.replace(/\/$/, '').split('/');
  const owner = parts[parts.length - 2];
  const repo = parts[parts.length - 1];
  const isGitHub = url.includes('github.com');

  if (isGitHub) {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        name: data.name,
        description: data.description,
        language: data.language,
        topics: data.topics,
        stars: data.stargazers_count,
      };
    } catch (error) {
      console.error('Error fetching GitHub repo:', error);
      return null;
    }
  }
  
  // GitLab support could be added here
  return null;
}
