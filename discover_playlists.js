
const axios = require('axios');
const fs = require('fs');

const languages = [
    "hindi", "english", "punjabi", "telugu", "kannada",
    "malayalam", "marathi", "bengali", "gujarati",
    "bhojpuri", "haryanvi", "rajasthani", "odia", "assamese"
];

const queries = [
    "Fresh Hits",
    "Trending",
    "Top Hits"
];

async function searchPlaylists(language) {
    console.log(`\nSearching for ${language}...`);
    for (const query of queries) {
        const searchQuery = `${query} ${language}`;
        const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(searchQuery)}`;

        try {
            const response = await axios.get(url);
            if (response.data && response.data.success && response.data.data.results) {
                const results = response.data.data.results.slice(0, 3); // Get top 3
                console.log(`  Query: "${searchQuery}"`);
                results.forEach(p => {
                    console.log(`    - [${p.id}] ${p.name} (Lang: ${p.language})`);
                });
            }
        } catch (error) {
            console.error(`    Error searching "${searchQuery}":`, error.message);
        }
    }
}

async function run() {
    for (const lang of languages) {
        await searchPlaylists(lang);
    }
}

run();
