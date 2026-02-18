
import axios from 'axios';

const baseUrl = "https://jiosavan-api-with-playlist.vercel.app/api";

const specificEndpoints = [
    "/home",
    "/home?language=tamil",
    "/modules?language=tamil", // Retesting just in case
    "/search/songs?query=tamil", // Baseline success
    "/charts",
    "/playlists",
    "/albums"
];

async function testHomeEndpoints() {
    console.log("Testing potential Home endpoints on jiosavan-api-with-playlist...\n");
    for (const path of specificEndpoints) {
        const url = `${baseUrl}${path}`;
        try {
            const res = await axios.get(url);
            console.log(`[PASS] ${path}`);
            console.log(`       Status: ${res.status}`);
            if (res.data) {
                if (res.data.data) {
                    const isArray = Array.isArray(res.data.data);
                    console.log(`       Data type: ${typeof res.data.data} ${isArray ? '(Array)' : '(Object)'}`);
                    if (isArray) console.log(`       Length: ${res.data.data.length}`);
                    else console.log(`       Keys: ${Object.keys(res.data.data).join(', ')}`);
                }
            }
        } catch (error) {
            console.log(`[FAIL] ${path}`);
            if (error.response) {
                console.log(`       Status: ${error.response.status}`);
            } else {
                console.log(`       Error: ${error.message}`);
            }
        }
        console.log("-".repeat(40));
    }
}

testHomeEndpoints();
