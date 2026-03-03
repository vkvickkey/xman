import axios from 'axios';

// Jio Saavan API endpoints
const JIO_SAAVAN_APIS = {
  primary: {
    name: "rajput-hemant-ts",
    base: "https://jiosaavn-api-ts.vercel.app",
    modules: "https://jiosaavn-api-ts.vercel.app/modules",
    search: "https://jiosaavn-api-ts.vercel.app/search/songs",
    songs: "https://jiosaavn-api-ts.vercel.app/song",
    playlists: "https://jiosaavn-api-ts.vercel.app/playlist",
    albums: "https://jiosaavn-api-ts.vercel.app/album",
    searchAll: "https://jiosaavn-api-ts.vercel.app/search",
    trending: "https://jiosaavn-api-ts.vercel.app/get/trending"
  },
  alternatives: [
    {
      name: "saavn.dev",
      base: "https://saavn.dev/api",
      modules: "https://saavn.dev/api/modules",
      search: "https://saavn.dev/api/search/songs",
      songs: "https://saavn.dev/api/songs",
      playlists: "https://saavn.dev/api/playlists",
      albums: "https://saavn.dev/api/albums"
    },
    {
      name: "jiosavan-api-with-playlist",
      base: "https://jiosavan-api-with-playlist.vercel.app/api",
      modules: "https://jiosavan-api-with-playlist.vercel.app/api/modules",
      search: "https://jiosavan-api-with-playlist.vercel.app/api/search/songs",
      songs: "https://jiosavan-api-with-playlist.vercel.app/api/songs",
      playlists: "https://jiosavan-api-with-playlist.vercel.app/api/playlists",
      albums: "https://jiosavan-api-with-playlist.vercel.app/api/albums"
    },
    {
      name: "saavn.sumit",
      base: "https://saavn.sumit.co/api",
      modules: "https://saavn.sumit.co/api/modules",
      search: "https://saavn.sumit.co/api/search/songs",
      songs: "https://saavn.sumit.co/api/songs",
      playlists: "https://saavn.sumit.co/api/playlists",
      albums: "https://saavn.sumit.co/api/albums"
    }
  ]
};

export class JioSaavanAPI {
  constructor() {
    this.currentAPIIndex = 0;
    this.failedAttempts = {};
    this.maxRetries = 3;
    this.currentAPI = JIO_SAAVAN_APIS.primary;
  }

  // Switch to alternative API
  switchToAlternative(index) {
    if (index >= 0 && index < JIO_SAAVAN_APIS.alternatives.length) {
      this.currentAPIIndex = index;
      this.currentAPI = JIO_SAAVAN_APIS.alternatives[index];
      return true;
    }
    return false;
  }

  // Reset to primary API
  resetToPrimary() {
    this.currentAPIIndex = 0;
    this.currentAPI = JIO_SAAVAN_APIS.primary;
    this.failedAttempts = {};
  }

  // Get current API info
  getCurrentAPI() {
    return {
      name: this.currentAPIIndex === 0 ? 'primary' : JIO_SAAVAN_APIS.alternatives[this.currentAPIIndex - 1]?.name || 'unknown',
      index: this.currentAPIIndex,
      endpoints: this.currentAPI
    };
  }

  // Make API request with fallback
  async makeRequest(endpoint, params = {}, retries = this.maxRetries) {
    const url = `${endpoint}?${new URLSearchParams(params)}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // Reset failed attempts on success
        const key = `${endpoint}-${JSON.stringify(params)}`;
        this.failedAttempts[key] = 0;
        
        return response.data;
        
      } catch (error) {
        const key = `${endpoint}-${JSON.stringify(params)}`;
        this.failedAttempts[key] = (this.failedAttempts[key] || 0) + 1;
        
        // Try alternative APIs if current one fails
        if (attempt < retries && this.currentAPIIndex === 0) {
          for (let i = 0; i < JIO_SAAVAN_APIS.alternatives.length; i++) {
            try {
              const alternativeAPI = JIO_SAAVAN_APIS.alternatives[i];
              let altEndpoint = endpoint.replace(this.currentAPI.base, alternativeAPI.base);
              
              // Adjust parameters for different API formats
              let altParams = { ...params };
              if (alternativeAPI.name === 'saavn.dev') {
                // Convert 'q' to 'query' and 'n' to 'limit' for saavn.dev
                if (altParams.q) altParams.query = altParams.q;
                if (altParams.n) altParams.limit = altParams.n;
                if (altParams.lang) altParams.language = altParams.lang;
                delete altParams.q;
                delete altParams.n;
                delete altParams.lang;
              }
              
              const altUrl = `${altEndpoint}?${new URLSearchParams(altParams)}`;
              
              const response = await axios.get(altUrl, { timeout: 10000 });
              this.switchToAlternative(i + 1);
              return response.data;
              
            } catch (altError) {
              console.warn(`Alternative API ${JIO_SAAVAN_APIS.alternatives[i].name} failed:`, altError.message);
            }
          }
        }
        
        // If we've exhausted all retries, throw the error
        if (attempt === retries) {
          throw new Error(`All Jio Saavan API attempts failed: ${error.message}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // Search songs
  async searchSongs(query, page = 1, limit = 10) {
    return this.makeRequest(this.currentAPI.search, {
      q: query,
      page,
      n: limit
    });
  }

  // Get modules by language
  async getModules(language = 'hindi') {
    return this.makeRequest(this.currentAPI.modules, {
      lang: language
    });
  }

  // Get song details by ID
  async getSongDetails(id) {
    return this.makeRequest(this.currentAPI.songs, {
      id
    });
  }

  // Get playlist details
  async getPlaylist(id) {
    return this.makeRequest(this.currentAPI.playlists, {
      id
    });
  }

  // Get album details
  async getAlbum(id) {
    return this.makeRequest(this.currentAPI.albums, {
      id
    });
  }

  // Get home data (all modules)
  async getHomeData() {
    return this.makeRequest(this.currentAPI.modules);
  }

  // Get songs by category
  async getSongsByCategory(category, page = 1, limit = 10) {
    return this.makeRequest(this.currentAPI.search, {
      q: category,
      page,
      n: limit
    });
  }

  // Get trending songs
  async getTrendingSongs(language = 'hindi', page = 1, limit = 10) {
    return this.makeRequest(this.currentAPI.trending, {
      type: 'song',
      lang: language,
      page,
      n: limit
    });
  }

  // Get new releases
  async getNewReleases(language = 'hindi', page = 1, limit = 10) {
    return this.makeRequest(this.currentAPI.search, {
      q: 'new releases',
      page,
      n: limit,
      lang: language
    });
  }

  // Health check for all APIs
  async healthCheck() {
    const results = [];
    
    // Check primary API
    try {
      const response = await axios.get(`${JIO_SAAVAN_APIS.primary.modules}?lang=hindi`, {
        timeout: 5000
      });
      results.push({
        name: 'primary',
        url: JIO_SAAVAN_APIS.primary.base,
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'unknown'
      });
    } catch (error) {
      results.push({
        name: 'primary',
        url: JIO_SAAVAN_APIS.primary.base,
        status: 'unhealthy',
        error: error.message
      });
    }
    
    // Check alternative APIs
    for (const altAPI of JIO_SAAVAN_APIS.alternatives) {
      try {
        const testEndpoint = altAPI.name === 'saavn.dev' ? 
          `${altAPI.modules}?language=hindi` : 
          `${altAPI.modules}?lang=hindi`;
        
        const response = await axios.get(testEndpoint, {
          timeout: 5000
        });
        results.push({
          name: altAPI.name,
          url: altAPI.base,
          status: 'healthy',
          responseTime: response.headers['x-response-time'] || 'unknown'
        });
      } catch (error) {
        results.push({
          name: altAPI.name,
          url: altAPI.base,
          status: 'unhealthy',
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get API status
  getAPIStatus() {
    return {
      current: this.getCurrentAPI(),
      failedAttempts: { ...this.failedAttempts },
      availableAPIs: {
        primary: JIO_SAAVAN_APIS.primary,
        alternatives: JIO_SAAVAN_APIS.alternatives
      }
    };
  }
}

// Export singleton instance
export const jioSaavanAPI = new JioSaavanAPI();

// Export convenience functions
export const searchSongs = (query, page, limit) => jioSaavanAPI.searchSongs(query, page, limit);
export const getModules = (language) => jioSaavanAPI.getModules(language);
export const getHomeData = () => jioSaavanAPI.getHomeData();
export const getSongDetails = (id) => jioSaavanAPI.getSongDetails(id);
export const getPlaylist = (id) => jioSaavanAPI.getPlaylist(id);
export const getAlbum = (id) => jioSaavanAPI.getAlbum(id);
export const getTrendingSongs = (language, page, limit) => jioSaavanAPI.getTrendingSongs(language, page, limit);
export const getNewReleases = (language, page, limit) => jioSaavanAPI.getNewReleases(language, page, limit);