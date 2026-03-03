# XMAN - Integrated Music & GitHub Management Dashboard

A comprehensive web application that combines Jio Saavan music streaming API with GitHub repository management, featuring automatic API fallback and multi-language support.

## 🎵 Features

### Jio Saavan Music Integration
- **Multi-API Support**: Primary API + 3 alternative APIs with automatic fallback
- **Search Functionality**: Search songs, artists, albums by query
- **Language Support**: Hindi, English, Tamil, Telugu, Punjabi, Marathi, Bengali, Gujarati, Kannada, Malayalam
- **Trending & New Releases**: Discover trending songs and new releases
- **Song Details**: Complete song information including quality, duration, artists
- **API Health Monitoring**: Real-time API status and health checks
- **Automatic Failover**: Switches to working APIs when primary fails

### GitHub Repository Management
- **Repository Operations**: List, search, check repository existence
- **Branch Management**: List branches, create new branches, check existence
- **Authentication**: Support for GitHub tokens (private repositories)
- **Content Access**: Repository contents and file operations
- **Search**: Search repositories by query

### Dashboard Features
- **Tabbed Interface**: Easy navigation between Music and GitHub sections
- **Real-time Status**: API health and connection status monitoring
- **Language Selection**: Dynamic language switching for music content
- **API Switching**: Manual API selection with visual feedback

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- GitHub token (for private repositories, optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vkvickkey/xman.git
cd xman
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the application**
- Main app: `http://localhost:5173`
- XMAN Dashboard: `http://localhost:5173/xman`

## 📁 Project Structure

```
xman/
├── src/
│   ├── components/
│   │   ├── XmanDashboard.jsx      # Main dashboard component
│   │   ├── JioSaavanManager.jsx   # Music management interface
│   │   └── GitHubManager.jsx      # GitHub management interface
│   ├── jioSaavanApi.js             # Jio Saavan API integration
│   ├── githubApi.js                # GitHub API integration
│   ├── apiConfig.js                # API configuration and endpoints
│   └── utils/
│       └── apiManager.js           # API management utilities
├── test_jio_saavan_api.js          # API testing script
└── README.md
```

## 🔧 Configuration

### Jio Saavan APIs

**Primary API (Working):**
- Base URL: `https://jiosaavn-api-ts.vercel.app`
- Status: ✅ Active and tested
- Features: Full API coverage with proper response format

**Alternative APIs:**
1. `https://saavn.dev/api` - May have connectivity issues
2. `https://jiosavan-api-with-playlist.vercel.app/api` - Payment required (402)
3. `https://saavn.sumit.co/api` - Limited endpoints (404)

### GitHub API Configuration

**Base URL:** `https://api.github.com`
**Version:** `2022-11-28`
**Authentication:** Bearer token (optional for public repos)

## 🧪 Testing

### Test Jio Saavan API
```bash
node test_jio_saavan_api.js
```

This will test:
- API health check for all endpoints
- Modules loading
- Song search functionality
- Song details retrieval
- Trending and new releases
- API switching mechanism
- Language support

### Expected Test Results
```
✅ primary: https://jiosaavn-api-ts.vercel.app
❌ saavn.dev: https://saavn.dev/api
❌ jiosavan-api-with-playlist: https://jiosavan-api-with-playlist.vercel.app/api  
❌ saavn.sumit: https://saavn.sumit.co/api

✅ Search completed: 5 songs found
✅ Trending songs: 24 found
✅ New releases: 3 found
```

## 📊 API Endpoints

### Jio Saavan API (Primary)

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/modules` | GET | `lang` | Get home modules by language |
| `/search/songs` | GET | `q`, `page`, `n` | Search songs by query |
| `/song` | GET | `id` | Get song details by ID |
| `/playlist` | GET | `id` | Get playlist details |
| `/album` | GET | `id` | Get album details |
| `/get/trending` | GET | `type`, `lang`, `page`, `n` | Get trending songs |

### GitHub API

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/user/repos` | GET | - | List user repositories |
| `/repos/{owner}/{repo}` | GET | - | Get repository details |
| `/repos/{owner}/{repo}/branches` | GET | - | List repository branches |
| `/repos/{owner}/{repo}/git/refs` | POST | `ref`, `sha` | Create new branch |
| `/search/repositories` | GET | `q`, `sort`, `order` | Search repositories |

## 🔄 API Fallback Mechanism

The application automatically switches to alternative APIs when the primary API fails:

1. **Primary API**: `jiosaavn-api-ts.vercel.app`
2. **Fallback 1**: `saavn.dev/api`
3. **Fallback 2**: `jiosavan-api-with-playlist.vercel.app/api`
4. **Fallback 3**: `saavn.sumit.co/api`

### Automatic Fallback Features
- **Retry Logic**: Up to 3 attempts per API
- **Parameter Adaptation**: Converts parameters for different API formats
- **Health Monitoring**: Continuous API health checks
- **Manual Switching**: User can manually select preferred API

## 🌍 Supported Languages

- **Hindi** - Default language
- **English**
- **Tamil**
- **Telugu**
- **Punjabi**
- **Marathi**
- **Bengali**
- **Gujarati**
- **Kannada**
- **Malayalam**

## 🔐 GitHub Authentication

For private repository access:

1. Generate a GitHub token at https://github.com/settings/tokens
2. Enter the token in the GitHub Manager section
3. Token is stored locally for convenience

**Permissions Recommended:**
- `public_repo` - Access public repositories
- `repo` - Access private repositories (if needed)

## 🛠️ Development

### Adding New APIs

1. Update `JIO_SAAVAN_APIS` in `src/jioSaavanApi.js`
2. Add parameter mapping in `makeRequest` method if needed
3. Update health check logic
4. Test with `node test_jio_saavan_api.js`

### Custom API Endpoints

```javascript
// Example: Add custom endpoint
const customAPI = {
  name: "custom-api",
  base: "https://your-api.com",
  modules: "https://your-api.com/modules",
  // ... other endpoints
};
```

## 📈 Performance Features

- **Caching**: API responses cached to reduce calls
- **Timeout Handling**: 10-second timeout for API requests
- **Error Recovery**: Automatic retry with exponential backoff
- **Rate Limiting**: Built-in rate limit awareness
- **Connection Pooling**: Efficient HTTP connection management

## 🐛 Troubleshooting

### Common Issues

1. **API Timeout**
   - Check internet connection
   - Try switching to alternative API
   - Verify API status in dashboard

2. **GitHub Authentication Failed**
   - Verify token is valid
   - Check token permissions
   - Ensure token hasn't expired

3. **No Search Results**
   - Try different search terms
   - Check language selection
   - Verify API is healthy

4. **Module Loading Failed**
   - Switch to alternative API
   - Check language parameter
   - Verify API connectivity

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 📝 API Response Formats

### Jio Saavan API Response
```javascript
{
  "status": "Success",
  "message": "✅ OK",
  "data": [
    {
      "id": "song_id",
      "name": "Song Name",
      "album": { "name": "Album Name" },
      "primaryArtists": "Artist Name",
      "duration": "3:45",
      "year": "2023",
      "media_url": "https://...",
      "320kbps": "true"
    }
  ]
}
```

### GitHub API Response
```javascript
{
  "id": 123456789,
  "name": "repository-name",
  "full_name": "owner/repository-name",
  "description": "Repository description",
  "default_branch": "main",
  "language": "JavaScript"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Jio Saavan APIs**: Various unofficial Jio Saavan API providers
- **GitHub API**: Official GitHub REST API
- **React**: UI framework
- **Tailwind CSS**: Styling framework
- **Axios**: HTTP client library

## 📞 Support

For issues and support:
- Create an issue on GitHub
- Check existing issues for solutions
- Review documentation for common problems

---

**XMAN Dashboard** - Your integrated solution for music streaming and repository management! 🎵🔧
