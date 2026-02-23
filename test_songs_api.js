import axios from 'axios';

async function testSongs() {
    const language = "Tamil";
    const query = `${language.toLowerCase()} hits`;
    const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=5`;
    try {
        const { data } = await axios.get(url);
        console.log(`\n--- Results for: ${query} ---`);
        if (data.data && data.data.results && data.data.results.length > 0) {
            data.data.results.forEach((s, i) => {
                console.log(`${i + 1}. ${s.name} (ID: ${s.id})`);
                console.log(`   Download URL exists: ${!!s.downloadUrl}`);
                if (s.downloadUrl) {
                    console.log(`   Download URLs count: ${s.downloadUrl.length}`);
                    console.log(`   Sample URL: ${s.downloadUrl[s.downloadUrl.length - 1]?.url}`);
                }
            });
        } else {
            console.log("No results found.");
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

testSongs();
