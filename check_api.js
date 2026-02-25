
import axios from 'axios';

const testUrls = [
    "https://saavn.sumit.co/api/search/songs?query=tamil&limit=1",
    "https://saavn.sumit.co/search/songs?query=tamil&limit=1",
    "https://saavn.dev/api/search/songs?query=tamil&limit=1",
    "https://saavn.dev/search/songs?query=tamil&limit=1"
];

async function test() {
    for (const url of testUrls) {
        try {
            const res = await axios.get(url);
            console.log(`[PASS] ${url} - Status: ${res.status}`);
        } catch (err) {
            console.log(`[FAIL] ${url} - Status: ${err.response?.status || err.message}`);
        }
    }
}

test();
