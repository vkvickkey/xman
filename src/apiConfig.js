export const SEARCH_API_BASE = "https://jiosavan-api-with-playlist.vercel.app/api";
export const MODULES_API_BASE = "https://jiosavan-api-with-playlist.vercel.app/api/modules";
export const DOWNLOAD_SERVER = "https://the-ultimate-songs-download-server-python.vercel.app";

export const getApiUrl = (type, path) => {
  switch (type) {
    case "search":
      return `${SEARCH_API_BASE}${path}`;
    case "modules":
      return `${MODULES_API_BASE}${path}`;
    case "download":
      return `${DOWNLOAD_SERVER}${path}`;
    default:
      return path;
  }
};
