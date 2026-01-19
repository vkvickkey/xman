const axios = require('axios');

const languages = ["Tamil", "Hindi", "English", "Telugu", "Malayalam"];

async function verifyFreshHits() {
    console.log("Verifying 'Fresh Hits' queries for different languages...");

    for (const lang of languages) {
        const query = `Fresh Hits ${lang}`;
        const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${encodeURIComponent(query)}&limit=5`;

        try {
            console.log(`\nFetching: "${query}"`);
            const { data } = await axios.get(url);

            if (data?.data?.results?.length > 0) {
                console.log(`✅ Success! Found ${data.data.results.length} playlists.`);
                data.data.results.slice(0, 3).forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
            } else {
                console.log(`❌ No results found for "${query}"`);
            }
        } catch (error) {
            console.error(`❌ Error fetching "${query}":`, error.message);
        }
    }
}

verifyFreshHits();
