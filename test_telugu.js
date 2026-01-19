import axios from 'axios';

const queries = [
    "Fresh Hits Telugu",
    "Telugu Hits",
    "Latest Telugu",
    "Telugu Top 50",
    "Telugu Viral"
];

async function checkTelugu() {
    for (const q of queries) {
        try {
            const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(q)}&limit=10`;
            const { data } = await axios.get(url);
            console.log(`\n--- Results for: ${q} ---`);
            if (data.data.results.length > 0) {
                data.data.results.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
            } else {
                console.log("No results found.");
            }
        } catch (e) {
            console.log(`Error checking ${q}: ${e.message}`);
        }
    }
}

checkTelugu();
