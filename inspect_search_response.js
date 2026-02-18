import axios from 'axios';

const baseUrl = "https://jiosavan-api-with-playlist.vercel.app/api";

const urls = [
    { name: "Playlists (Top Tamil)", url: `${baseUrl}/search/playlists?query=Top Tamil` },
    { name: "Albums (Latest Tamil)", url: `${baseUrl}/search/albums?query=Latest Tamil` },
    { name: "Songs (Tamil)", url: `${baseUrl}/search/songs?query=Tamil` }
];

async function inspect() {
    console.log("Inspecting API responses...");
    for (const { name, url } of urls) {
        try {
            const { data } = await axios.get(url);
            console.log(`\n--- ${name} ---`);
            if (data.data && data.data.results && data.data.results.length > 0) {
                const item = data.data.results[0];
                console.log(JSON.stringify(item, null, 2));
            } else {
                console.log("No results found or unexpected structure.");
                console.log("Keys:", Object.keys(data));
            }
        } catch (error) {
            console.error(`Error fetching ${name}:`, error.message);
        }
    }
}

inspect();
