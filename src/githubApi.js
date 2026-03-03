import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubAPI {
  constructor(token = null) {
    this.token = token;
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Repository Management
  async getUserRepositories() {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user repositories:', error.response?.data || error.message);
      throw error;
    }
  }

  async getRepository(owner, repo) {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repository:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrganizationRepositories(org) {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/orgs/${org}/repos`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching organization repositories:', error.response?.data || error.message);
      throw error;
    }
  }

  // Branch Management
  async getBranches(owner, repo) {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching branches:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBranch(owner, repo, branch) {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${branch}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching branch:', error.response?.data || error.message);
      throw error;
    }
  }

  async createBranch(owner, repo, branchName, fromBranch = 'main') {
    try {
      // Get the latest commit from the source branch
      const sourceBranch = await this.getBranch(owner, repo, fromBranch);
      const sha = sourceBranch.commit.sha;

      // Create the new branch
      const response = await axios.post(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha: sha
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', error.response?.data || error.message);
      throw error;
    }
  }

  async renameBranch(owner, repo, oldName, newName) {
    try {
      const response = await axios.post(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${oldName}/rename`, {
        new_name: newName
      }, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error renaming branch:', error.response?.data || error.message);
      throw error;
    }
  }

  // Check if repository/branch exists
  async repositoryExists(owner, repo) {
    try {
      await this.getRepository(owner, repo);
      return true;
    } catch (error) {
      return false;
    }
  }

  async branchExists(owner, repo, branch) {
    try {
      await this.getBranch(owner, repo, branch);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get repository contents
  async getRepositoryContents(owner, repo, path = '') {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repository contents:', error.response?.data || error.message);
      throw error;
    }
  }

  // Search repositories
  async searchRepositories(query, sort = 'updated', order = 'desc') {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/search/repositories`, {
        params: { q: query, sort, order },
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Error searching repositories:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export a singleton instance
export const githubAPI = new GitHubAPI();

// Utility functions
export const checkGitHubConnectivity = async () => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/rate_limit`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};
