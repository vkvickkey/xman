import axios from 'axios';

async function checkTamil() {
    const query = "Tamil Hits";
    try {
        const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(query)}&limit=10`;
        const { data } = await axios.get(url);
        console.log(`\n--- Results for: ${query} ---`);
        if (data.data.results.length > 0) {
            data.data.results.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
        } else {
            console.log("No results found.");
        }
    } catch (e) {
        console.log(`Error checking ${query}: ${e.message}`);
    }
}

checkTamil();
