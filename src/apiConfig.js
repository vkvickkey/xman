export const SEARCH_API_BASE = import.meta.env.DEV ? "/api" : "https://jiosaavn-api-ts.vercel.app/search/songs";
export const MODULES_API_BASE = import.meta.env.DEV ? "/api/modules" : "https://jiosaavn-api-ts.vercel.app/modules";
export const DOWNLOAD_SERVER = "https://the-ultimate-songs-download-server-python.vercel.app";

// Jio Saavan API endpoints - Updated with working primary API
export const JIO_SAAVAN_APIS = {
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

// Alternative API endpoints for fallback - Updated with working API first
export const ALTERNATIVE_APIS = {
  search: [
    "https://jiosaavn-api-ts.vercel.app/search/songs",
    "https://saavn.dev/api/search/songs",
    "https://jiosavan-api-with-playlist.vercel.app/api/search/songs",
    "https://saavn.sumit.co/api/search/songs"
  ],
  modules: [
    "https://jiosaavn-api-ts.vercel.app/modules",
    "https://saavn.dev/api/modules",
    "https://jiosavan-api-with-playlist.vercel.app/api/modules"
  ],
  download: [
    "https://the-ultimate-songs-download-server-python.vercel.app"
  ]
};

// GitHub API configuration
export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_API_VERSION = "2022-11-28";

export const getApiUrl = (type, path, useAlternative = false, alternativeIndex = 0) => {
  let baseUrl;
  
  if (useAlternative && ALTERNATIVE_APIS[type]) {
    const alternatives = ALTERNATIVE_APIS[type];
    baseUrl = alternatives[alternativeIndex % alternatives.length];
  } else {
    switch (type) {
      case "search":
        // For search endpoints, path already includes "/api/"
        baseUrl = SEARCH_API_BASE;
        break;
      case "modules":
        baseUrl = MODULES_API_BASE;
        break;
      case "download":
        baseUrl = DOWNLOAD_SERVER;
        break;
      case "github":
        baseUrl = GITHUB_API_BASE;
        break;
      default:
        return path;
    }
  }
  
  return `${baseUrl}${path}`;
};

// API health check and switching utility
export const switchToAlternativeAPI = async (type, path) => {
  const alternatives = ALTERNATIVE_APIS[type] || [];
  
  for (let i = 0; i < alternatives.length; i++) {
    try {
      const testUrl = `${alternatives[i]}${path}`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      if (response.ok) {
        return alternatives[i];
      }
    } catch (error) {
      console.warn(`Alternative API ${alternatives[i]} failed:`, error.message);
    }
  }
  
  return null;
};
