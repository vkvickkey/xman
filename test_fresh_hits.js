import axios from 'axios';

const languages = ["Tamil", "Hindi", "English", "Telugu", "Malayalam"];

async function checkFreshHits() {
    for (const lang of languages) {
        try {
            const query = `Fresh Hits ${lang}`;
            const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(query)}&limit=5`;
            const { data } = await axios.get(url);
            console.log(`\n--- Results for: ${query} ---`);
            if (data.data.results.length > 0) {
                data.data.results.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
            } else {
                console.log("No results found.");
            }
        } catch (e) {
            console.log(`Error fetching for ${lang}: ${e.message}`);
        }
    }
}

checkFreshHits();
