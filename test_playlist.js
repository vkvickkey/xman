
import axios from 'axios';

const playlistId = "82914609"; // Example playlist ID
const url = `https://jiosavan-api-with-playlist.vercel.app/api/playlists?id=${playlistId}`;

async function testPlaylist() {
    console.log(`Testing playlist endpoint: ${url}`);
    try {
        const res = await axios.get(url);
        console.log(`[PASS] Status: ${res.status}`);
        if (res.data.data) {
            console.log(`       Playlist Name: ${res.data.data.name}`);
            console.log(`       Song Count: ${res.data.data.songCount}`);
        }
    } catch (error) {
        console.log(`[FAIL] Error: ${error.message}`);
        if (error.response) {
            console.log(`       Status: ${error.response.status}`);
            console.log(`       Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testPlaylist();
