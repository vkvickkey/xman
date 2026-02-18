
import axios from 'axios';

const endpoints = [
    { name: "saavn.dev (Config)", url: "https://saavn.dev/api/modules?language=tamil" },
    { name: "jiosavan-api-with-playlist", url: "https://jiosavan-api-with-playlist.vercel.app/api/modules?language=tamil" },
    { name: "saavn.dev (Search Songs)", url: "https://saavn.dev/api/search/songs?query=tamil&page=1&limit=5" },
    { name: "jiosavan-api-with-playlist (Search Songs)", url: "https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=tamil&page=1&limit=5" }
];

async function testEndpoints() {
    console.log("Starting API connectivity tests...\n");
    for (const endpoint of endpoints) {
        try {
            const start = Date.now();
            const res = await axios.get(endpoint.url);
            const duration = Date.now() - start;
            console.log(`[PASS] ${endpoint.name}`);
            console.log(`       URL: ${endpoint.url}`);
            console.log(`       Status: ${res.status}`);
            console.log(`       Time: ${duration}ms`);

            if (res.data) {
                if (res.data.status) console.log(`       API Status: ${res.data.status}`);
                if (res.data.data) {
                    // console.log(`       Data keys: ${Object.keys(res.data.data).join(', ')}`);
                }
            }

        } catch (error) {
            console.log(`[FAIL] ${endpoint.name}`);
            console.log(`       URL: ${endpoint.url}`);
            console.log(`       Error: ${error.message}`);
            if (error.response) {
                console.log(`       Status: ${error.response.status}`);
                console.log(`       Data: ${JSON.stringify(error.response.data).substring(0, 100)}`);
            }
        }
        console.log("-".repeat(40));
    }
}

testEndpoints();
