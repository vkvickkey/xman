const axios = require('axios');

async function checkLanguageSongs(language) {
    console.log(`\n--- Checking ${language} Songs ---`);
    const baseUrl = "https://jiosavan-api-with-playlist.vercel.app/api/search/songs";

    // Check Page 1
    try {
        const url1 = `${baseUrl}?query=${language}&page=1&limit=5`;
        const res1 = await axios.get(url1);
        const songs1 = res1.data.data.results || [];
        console.log(`Page 1 found ${songs1.length} songs.`);
        if (songs1.length > 0) {
            console.log(`- First song: ${songs1[0].name} (${songs1[0].id})`);
        } else {
            console.log("! No songs found on Page 1");
            return;
        }

        // Check Page 2
        const url2 = `${baseUrl}?query=${language}&page=2&limit=5`;
        const res2 = await axios.get(url2);
        const songs2 = res2.data.data.results || [];
        console.log(`Page 2 found ${songs2.length} songs.`);

        if (songs2.length > 0) {
            console.log(`- First song: ${songs2[0].name} (${songs2[0].id})`);
            // Check for duplicates between page 1 and 2
            const ids1 = songs1.map(s => s.id);
            const ids2 = songs2.map(s => s.id);
            const duplicates = ids2.filter(id => ids1.includes(id));

            if (duplicates.length > 0) {
                console.log(`! WARNING: Found ${duplicates.length} duplicates between Page 1 and Page 2.`);
            } else {
                console.log("PERFECT: No duplicates found between Page 1 and Page 2.");
            }
        }


    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    await checkLanguageSongs("Tamil");
    await checkLanguageSongs("Malayalam");
    await checkLanguageSongs("English");
    await checkLanguageSongs("Telugu");
}

run();
