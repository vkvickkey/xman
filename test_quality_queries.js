import axios from 'axios';

const baseUrl = "https://jiosavan-api-with-playlist.vercel.app/api";

const queries = [
    "Tamil Hits",
    "Top Tamil Songs",
    "Latest Tamil",
    "Tamil Trending",
    "English Hits",
    "Hindi Top 50"
];

async function testQualityQueries() {
    console.log("Testing search queries for 'Best' songs...\n");
    for (const q of queries) {
        const url = `${baseUrl}/search/songs?query=${encodeURIComponent(q)}&limit=5`;
        try {
            const res = await axios.get(url);
            console.log(`[QUERY] "${q}"`);
            if (res.data && res.data.data && res.data.data.results) {
                const songs = res.data.data.results.map(s => s.name);
                console.log(`        Results: ${songs.join(', ')}...`);
            } else {
                console.log(`        No data or results.`);
            }
        } catch (error) {
            console.log(`[FAIL] "${q}" - ${error.message}`);
        }
        console.log("-".repeat(40));
    }
}

testQualityQueries();
