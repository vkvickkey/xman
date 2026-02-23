import axios from 'axios';

async function testSongs() {
    const language = "Tamil";
    const query = `${language.toLowerCase()} hits`;
    const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;
    try {
        const { data } = await axios.get(url);
        if (data.data && data.data.results && data.data.results.length > 0) {
            console.log(JSON.stringify(data.data.results[0].image, null, 2));
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

testSongs();
