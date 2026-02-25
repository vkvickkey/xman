export const SEARCH_API_BASE = import.meta.env.DEV ? "/api" : "https://saavn.sumit.co";
export const MODULES_API_BASE = import.meta.env.DEV ? "/api/modules" : "https://saavn.sumit.co/api/modules";
export const DOWNLOAD_SERVER = "https://the-ultimate-songs-download-server-python.vercel.app";

export const getApiUrl = (type, path) => {
  switch (type) {
    case "search":
      // For search endpoints, path already includes "/api/"
      return `${SEARCH_API_BASE}${path}`;
    case "modules":
      return `${MODULES_API_BASE}${path}`;
    case "download":
      return `${DOWNLOAD_SERVER}${path}`;
    default:
      return path;
  }
};
