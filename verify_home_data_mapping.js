import axios from 'axios';

const language = "Tamil";
const baseUrl = "https://jiosavan-api-with-playlist.vercel.app/api";

const getApiUrl = (type, path) => {
    return `${baseUrl}${path}`;
};

async function verifyMapping() {
    console.log("Verifying Home Data Mapping...");
    try {
        const [trendingSongsRes, trendingAlbumsRes, chartsRes, playlistsRes, albumsRes] = await Promise.all([
            axios.get(getApiUrl("search", `/search/songs?query=Trending ${language}&limit=5`)),
            axios.get(getApiUrl("search", `/search/albums?query=Trending ${language}&limit=5`)),
            axios.get(getApiUrl("search", `/search/playlists?query=Top ${language}&limit=5`)),
            axios.get(getApiUrl("search", `/search/playlists?query=${language} Hits&limit=5`)),
            axios.get(getApiUrl("search", `/search/albums?query=Latest ${language}&limit=5`))
        ]);

        const mapItems = (items) => items ? items.map(item => ({
            id: item.id,
            name: item.name,
            title: item.title || item.name,
            subtitle: item.subtitle || item.description || "",
            type: item.type,
            image: item.image ? item.image.map(img => ({ ...img, link: img.url })) : [],
            url: item.url, // Keep url for reference
            songs: item.songs || []
        })) : [];

        const homeData = {
            charts: mapItems(chartsRes.data.data.results),
            albums: mapItems(albumsRes.data.data.results),
            playlists: mapItems(playlistsRes.data.data.results),
            trending: {
                songs: mapItems(trendingSongsRes.data.data.results),
                albums: mapItems(trendingAlbumsRes.data.data.results)
            }
        };

        console.log("\nMapped Home Data Structure (First Item of Each Category):");

        if (homeData.charts.length > 0) {
            console.log("\n[Charts] First Item:");
            console.log(JSON.stringify(homeData.charts[0], null, 2));
        }

        if (homeData.albums.length > 0) {
            console.log("\n[Albums] First Item:");
            console.log(JSON.stringify(homeData.albums[0], null, 2));
        }

        if (homeData.playlists.length > 0) {
            console.log("\n[Playlists] First Item:");
            console.log(JSON.stringify(homeData.playlists[0], null, 2));
        }

    } catch (error) {
        console.log("Error verifying home data mapping:", error);
    }
}

verifyMapping();
