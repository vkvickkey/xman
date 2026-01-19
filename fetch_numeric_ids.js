import axios from 'axios';

const queries = [
    "Mersal Hits",
    "New Indie - Tamil",
    "Semma Pop",
    "Dance Podu",
    "Tamil Viral Hits",
    "Kadhaley"
];

async function fetchIds() {
    const results = {};
    for (const query of queries) {
        try {
            const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(query)}&limit=1`;
            const { data } = await axios.get(url);
            if (data.data.results.length > 0) {
                results[query] = data.data.results[0].id;
            } else {
                results[query] = "Not Found";
            }
        } catch (e) {
            results[query] = `Error: ${e.message}`;
        }
    }
    console.log(JSON.stringify(results, null, 2));
}

fetchIds();
