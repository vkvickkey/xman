import React, { useState, useEffect } from 'react';
import { githubAPI, checkGitHubConnectivity } from '../githubApi';
import { toast } from 'react-hot-toast';

const GitHubManager = () => {
  const [token, setToken] = useState(localStorage.getItem('github_token') || '');
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (token) {
      checkConnection();
    }
  }, [token]);

  const checkConnection = async () => {
    try {
      const result = await checkGitHubConnectivity();
      setIsConnected(result.success);
      if (result.success) {
        toast.success('GitHub API connected successfully');
      } else {
        toast.error('Failed to connect to GitHub API');
      }
    } catch (error) {
      setIsConnected(false);
      toast.error('GitHub API connection failed');
    }
  };

  const handleTokenChange = (e) => {
    const newToken = e.target.value;
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('github_token', newToken);
      githubAPI.token = newToken;
      githubAPI.headers['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('github_token');
      githubAPI.token = null;
      delete githubAPI.headers['Authorization'];
    }
  };

  const fetchUserRepositories = async () => {
    setLoading(true);
    try {
      const repos = await githubAPI.getUserRepositories();
      setRepositories(repos);
      toast.success(`Found ${repos.length} repositories`);
    } catch (error) {
      toast.error('Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const branchList = await githubAPI.getBranches(owner, repo);
      setBranches(branchList);
      toast.success(`Found ${branchList.length} branches`);
    } catch (error) {
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const createNewBranch = async () => {
    if (!selectedRepo || !newBranchName) {
      toast.error('Please select repository and enter branch name');
      return;
    }

    setLoading(true);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const sourceBranch = selectedBranch || 'main';
      
      const result = await githubAPI.createBranch(owner, repo, newBranchName, sourceBranch);
      toast.success(`Branch "${newBranchName}" created successfully`);
      setNewBranchName('');
      await fetchBranches();
    } catch (error) {
      toast.error('Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">GitHub Repository Manager</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Token
        </label>
        <input
          type="password"
          value={token}
          onChange={handleTokenChange}
          placeholder="Enter your GitHub token"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={checkConnection}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Check Connection
        </button>
        {isConnected && (
          <span className="ml-2 text-green-600">✓ Connected</span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Your Repositories</h3>
        <button
          onClick={fetchUserRepositories}
          disabled={loading}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md"
        >
          Fetch Repositories
        </button>
        
        {repositories.length > 0 && (
          <div className="mt-3">
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a repository</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedRepo && (
        <div className="mb-6">
          <button
            onClick={fetchBranches}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-md"
          >
            Fetch Branches
          </button>
        </div>
      )}

      {branches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Branch Management</h3>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          >
            <option value="">Select a branch</option>
            {branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="New branch name"
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={createNewBranch}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Create Branch
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default GitHubManager;
