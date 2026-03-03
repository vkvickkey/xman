import axios from 'axios';
import { getApiUrl, switchToAlternativeAPI, ALTERNATIVE_APIS } from '../apiConfig';

class APIManager {
  constructor() {
    this.currentAPIs = {
      search: 0,
      modules: 0,
      download: 0
    };
    this.failedAttempts = {};
    this.maxRetries = 3;
  }

  async makeRequest(type, path, options = {}) {
    const { useAlternative = false, retries = this.maxRetries } = options;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = getApiUrl(type, path, useAlternative, this.currentAPIs[type]);
        const response = await axios({
          method: 'GET',
          url,
          timeout: 10000,
          ...options
        });
        
        // Reset failed attempts on success
        this.failedAttempts[`${type}-${path}`] = 0;
        return response;
        
      } catch (error) {
        const key = `${type}-${path}`;
        this.failedAttempts[key] = (this.failedAttempts[key] || 0) + 1;
        
        // If we have alternative APIs and this isn't the last attempt
        if (attempt < retries && ALTERNATIVE_APIS[type]) {
          console.warn(`API ${type} attempt ${attempt + 1} failed, trying alternative...`);
          
          // Try to find a working alternative API
          const alternativeUrl = await switchToAlternativeAPI(type, path);
          if (alternativeUrl) {
            this.currentAPIs[type] = ALTERNATIVE_APIS[type].indexOf(alternativeUrl);
            continue;
          }
        }
        
        // If we've exhausted all retries, throw the error
        if (attempt === retries) {
          throw new Error(`All API attempts failed for ${type}: ${error.message}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  async searchSongs(query, page = 1, limit = 10) {
    const path = `/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const response = await this.makeRequest('search', path);
    return response.data;
  }

  async getModules(language = 'hindi') {
    const path = `/modules?language=${language}`;
    const response = await this.makeRequest('modules', path);
    return response.data;
  }

  async getHomeData() {
    const path = '/modules';
    const response = await this.makeRequest('modules', path);
    return response.data;
  }

  async getSongDetails(id) {
    const path = `/songs?id=${id}`;
    const response = await this.makeRequest('search', path);
    return response.data;
  }

  async getPlaylist(id) {
    const path = `/playlists?id=${id}`;
    const response = await this.makeRequest('search', path);
    return response.data;
  }

  async getAlbum(id) {
    const path = `/albums?id=${id}`;
    const response = await this.makeRequest('search', path);
    return response.data;
  }

  async downloadSong(id, quality = '320') {
    const path = `/download?id=${id}&quality=${quality}`;
    const response = await this.makeRequest('download', path);
    return response.data;
  }

  // Health check for all APIs
  async healthCheck() {
    const results = {};
    
    for (const [type, apis] of Object.entries(ALTERNATIVE_APIS)) {
      results[type] = [];
      
      for (const api of apis) {
        try {
          const testPath = type === 'search' ? '/search/songs?query=test&limit=1' : 
                          type === 'modules' ? '/modules?language=hindi' : '/health';
          
          const response = await axios.get(`${api}${testPath}`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500 
          });
          
          results[type].push({
            url: api,
            status: response.status,
            healthy: response.status < 400,
            responseTime: response.headers['x-response-time'] || 'unknown'
          });
        } catch (error) {
          results[type].push({
            url: api,
            status: error.response?.status || 'timeout',
            healthy: false,
            error: error.message
          });
        }
      }
    }
    
    return results;
  }

  // Get current API status
  getAPIStatus() {
    return {
      currentAPIs: { ...this.currentAPIs },
      failedAttempts: { ...this.failedAttempts },
      availableAPIs: { ...ALTERNATIVE_APIS }
    };
  }

  // Reset to primary APIs
  resetToPrimary() {
    this.currentAPIs = {
      search: 0,
      modules: 0,
      download: 0
    };
    this.failedAttempts = {};
  }

  // Switch to specific alternative API
  switchAPI(type, alternativeIndex) {
    if (ALTERNATIVE_APIS[type] && alternativeIndex < ALTERNATIVE_APIS[type].length) {
      this.currentAPIs[type] = alternativeIndex;
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const apiManager = new APIManager();

// Export convenience functions
export const searchSongs = (query, page, limit) => apiManager.searchSongs(query, page, limit);
export const getModules = (language) => apiManager.getModules(language);
export const getHomeData = () => apiManager.getHomeData();
export const getSongDetails = (id) => apiManager.getSongDetails(id);
export const getPlaylist = (id) => apiManager.getPlaylist(id);
export const getAlbum = (id) => apiManager.getAlbum(id);
export const downloadSong = (id, quality) => apiManager.downloadSong(id, quality);
