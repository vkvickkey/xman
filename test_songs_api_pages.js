import axios from 'axios';

async function testSongs(page) {
    const language = "Tamil";
    const query = `${language.toLowerCase()} hits`;
    const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=20`;
    try {
        const { data } = await axios.get(url);
        console.log(`\n--- Results for: ${query} (Page ${page}) ---`);
        if (data.data && data.data.results && data.data.results.length > 0) {
            console.log(`Found ${data.data.results.length} results.`);
        } else {
            console.log("No results found.");
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

testSongs(30);
testSongs(50);
testSongs(100);
