const axios = require('axios');

async function verifyIdParam() {
    const query = "Fresh Hits Tamil";
    const url = `https://jiosavan-api-with-playlist.vercel.app/api/playlists?id=${encodeURIComponent(query)}`;

    console.log(`Testing URL: ${url}`);

    try {
        const { data } = await axios.get(url);
        console.log("Response status:", data.status);
        if (data.data) {
            console.log("Data found type:", Array.isArray(data.data) ? "Array" : "Object");
            if (Array.isArray(data.data)) {
                console.log("Count:", data.data.length);
                console.log("First item:", data.data[0].name);
            } else {
                console.log("Name:", data.data.name);
                console.log("ID:", data.data.id);
            }
        } else {
            console.log("No data returned.");
        }
    } catch (e) {
        console.log("Error:", e.message);
        if (e.response) {
            console.log("Response data:", e.response.data);
        }
    }
}

verifyIdParam();
