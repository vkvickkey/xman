
const axios = require('axios');

const languages = ["Tamil", "Hindi", "English"];

async function searchPlaylists(query) {
    console.log(`\n--- Searching for: "${query}" ---`);
    try {
        const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(query)}&limit=5`;
        const { data } = await axios.get(url);
        if (data?.data?.results?.length > 0) {
            data.data.results.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
        } else {
            console.log("No results found.");
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function test() {
    for (const lang of languages) {
        await searchPlaylists(`Top Genres & Moods ${lang}`);
        await searchPlaylists(`Best of 90s ${lang}`);
        await searchPlaylists(`90s ${lang}`);
        await searchPlaylists(`Moods ${lang}`);
    }
}

test();
