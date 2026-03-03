import React, { useState, useEffect } from 'react';
import { jioSaavanAPI } from '../jioSaavanApi';
import { toast } from 'react-hot-toast';

const JioSaavanManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [currentAPI, setCurrentAPI] = useState({});
  const [apiHealth, setApiHealth] = useState([]);
  const [songDetails, setSongDetails] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const languages = ['hindi', 'english', 'punjabi', 'tamil', 'telugu', 'marathi', 'bengali', 'gujarati', 'kannada', 'malayalam'];

  useEffect(() => {
    updateAPIStatus();
    loadModules();
  }, []);

  const updateAPIStatus = () => {
    const status = jioSaavanAPI.getCurrentAPI();
    setCurrentAPI(status);
  };

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await jioSaavanAPI.getModules(selectedLanguage);
      const modulesData = data.data || [];
      setModules(modulesData);
      toast.success(`Loaded ${modulesData.length} modules`);
    } catch (error) {
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const results = await jioSaavanAPI.searchSongs(searchQuery, 1, 20);
      const songsData = results.data || results.results || [];
      setSearchResults(songsData);
      updateAPIStatus();
      toast.success(`Found ${songsData.length} songs`);
    } catch (error) {
      toast.error('Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (language) => {
    setSelectedLanguage(language);
    setLoading(true);
    try {
      const data = await jioSaavanAPI.getModules(language);
      const modulesData = data.data || [];
      setModules(modulesData);
      toast.success(`Switched to ${language} modules`);
    } catch (error) {
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const getSongDetails = async (song) => {
    if (!song.id) return;
    
    setLoading(true);
    try {
      const details = await jioSaavanAPI.getSongDetails(song.id);
      const songData = details.data?.[0] || details.data || details;
      setSongDetails(songData);
      setSelectedSong(song);
      updateAPIStatus();
    } catch (error) {
      toast.error('Failed to get song details');
    } finally {
      setLoading(false);
    }
  };

  const switchAPI = (index) => {
    if (jioSaavanAPI.switchToAlternative(index)) {
      updateAPIStatus();
      toast.success(`Switched to ${index === 0 ? 'primary' : `alternative ${index}`} API`);
    } else {
      toast.error('Failed to switch API');
    }
  };

  const resetToPrimary = () => {
    jioSaavanAPI.resetToPrimary();
    updateAPIStatus();
    toast.success('Reset to primary API');
  };

  const checkAPIHealth = async () => {
    setLoading(true);
    try {
      const health = await jioSaavanAPI.healthCheck();
      setApiHealth(health);
      toast.success('API health check completed');
    } catch (error) {
      toast.error('Health check failed');
    } finally {
      setLoading(false);
    }
  };

  const getTrendingSongs = async () => {
    setLoading(true);
    try {
      const trending = await jioSaavanAPI.getTrendingSongs(selectedLanguage, 1, 10);
      const songsData = trending.data || trending.results || [];
      setSearchResults(songsData);
      updateAPIStatus();
      toast.success('Trending songs loaded');
    } catch (error) {
      toast.error('Failed to load trending songs');
    } finally {
      setLoading(false);
    }
  };

  const getNewReleases = async () => {
    setLoading(true);
    try {
      const newReleases = await jioSaavanAPI.getNewReleases(selectedLanguage, 1, 10);
      const songsData = newReleases.data || newReleases.results || [];
      setSearchResults(songsData);
      updateAPIStatus();
      toast.success('New releases loaded');
    } catch (error) {
      toast.error('Failed to load new releases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Jio Saavan Music Manager</h2>
      
      {/* API Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">API Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Current API: <span className="font-semibold">{currentAPI.name}</span></p>
            <p className="text-sm text-gray-600">Index: {currentAPI.index}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetToPrimary}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Reset to Primary
            </button>
            <button
              onClick={checkAPIHealth}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              Health Check
            </button>
          </div>
        </div>
        
        {/* API Switcher */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => switchAPI(0)}
            className={`px-3 py-1 rounded text-sm ${currentAPI.index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Primary
          </button>
          <button
            onClick={() => switchAPI(1)}
            className={`px-3 py-1 rounded text-sm ${currentAPI.index === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Alternative 1
          </button>
          <button
            onClick={() => switchAPI(2)}
            className={`px-3 py-1 rounded text-sm ${currentAPI.index === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Alternative 2
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 rounded-full text-sm ${selectedLanguage === lang ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Search Songs</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for songs, artists, albums..."
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            Search
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={getTrendingSongs}
            disabled={loading}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            Trending
          </button>
          <button
            onClick={getNewReleases}
            disabled={loading}
            className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 disabled:opacity-50"
          >
            New Releases
          </button>
        </div>
      </div>

      {/* Modules Display */}
      {modules.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Music Modules ({selectedLanguage})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {modules.map((module, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <h4 className="font-medium text-sm">{module.name || `Module ${index + 1}`}</h4>
                <p className="text-xs text-gray-600 mt-1">{module.title || 'No title'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Search Results ({searchResults.length} songs)</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((song, index) => (
              <div key={song.id || index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => getSongDetails(song)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{song.name || song.title || 'Unknown Song'}</h4>
                    <p className="text-sm text-gray-600">{song.album?.name || song.album || 'Unknown Album'}</p>
                    <p className="text-xs text-gray-500">{song.primaryArtists || song.artists || 'Unknown Artist'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{song.duration || '0:00'}</p>
                    <p className="text-xs text-gray-500">{song.year || 'Unknown Year'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Song Details */}
      {songDetails && selectedSong && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Song Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm"><strong>Title:</strong> {songDetails.name || songDetails.title || 'Unknown'}</p>
              <p className="text-sm"><strong>Album:</strong> {songDetails.album?.name || songDetails.album || 'N/A'}</p>
              <p className="text-sm"><strong>Artists:</strong> {songDetails.primaryArtists || songDetails.artists || 'N/A'}</p>
              <p className="text-sm"><strong>Duration:</strong> {songDetails.duration || 'N/A'}</p>
              <p className="text-sm"><strong>Year:</strong> {songDetails.year || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm"><strong>Label:</strong> {songDetails.label || 'N/A'}</p>
              <p className="text-sm"><strong>Copyright:</strong> {songDetails.copyright || 'N/A'}</p>
              <p className="text-sm"><strong>Media URL:</strong> {songDetails.media_url ? 'Available' : 'Not Available'}</p>
              <p className="text-sm"><strong>Download URL:</strong> {songDetails.download_url ? 'Available' : 'Not Available'}</p>
              <p className="text-sm"><strong>Quality:</strong> {songDetails['320kbps'] === 'true' ? '320kbps Available' : 'Standard'}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Health Results */}
      {apiHealth.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">API Health Status</h3>
          <div className="space-y-2">
            {apiHealth.map((api, index) => (
              <div key={index} className={`p-3 rounded-lg ${api.status === 'healthy' ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{api.name}</p>
                    <p className="text-sm text-gray-600">{api.url}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${api.status === 'healthy' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {api.status}
                    </span>
                    {api.responseTime && (
                      <p className="text-xs text-gray-500 mt-1">{api.responseTime}</p>
                    )}
                  </div>
                </div>
                {api.error && (
                  <p className="text-sm text-red-600 mt-2">{api.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default JioSaavanManager;
