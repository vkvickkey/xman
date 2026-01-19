import axios from 'axios';

const queries = [
    "Fresh Hits Hindi",
    "Hindi Hits",
    "Latest Hindi",
    "Hindi Top 50",
    "Hindi Viral"
];

async function checkHindi() {
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

checkHindi();
