const axios = require('axios');

const playlistsToVerify = [
    { name: "Pudhu Tunes", expectedToken: "Q1POpnJeUPI_" },
    { name: "Mersal Hits", expectedToken: "x7NaWNE3kRw_" },
    { name: "New Indie - Tamil", expectedToken: "48,mFdXIBES5MW-661Z5Dg__" },
    { name: "Semma Pop", expectedToken: "n,0ZJtShoPI_" },
    { name: "Dance Podu", expectedToken: "BDcUde,4zxI_" },
    { name: "ArtistOne Finds", expectedToken: "nOyNH0fuWtGP3AiNrzXpzA__" },
    { name: "Tamil Viral Hits", expectedToken: "Qh3xJvaftt0_" },
    { name: "Kadhaley", expectedToken: "6sjR6zr,4PM_" }
];

async function verify() {
    console.log("Starting verification...");
    for (const item of playlistsToVerify) {
        try {
            const query = encodeURIComponent(item.name);
            const url = `https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=${query}`;
            const { data } = await axios.get(url);

            if (data && data.data && data.data.results && data.data.results.length > 0) {
                // Find the result that matches the name strictly or contains the token in URL
                const match = data.data.results.find(r =>
                    (r.url && r.url.includes(item.expectedToken)) ||
                    r.name.toLowerCase() === item.name.toLowerCase()
                );

                if (match) {
                    console.log(`MATCH FOUND for "${item.name}":`);
                    console.log(`   - ID: ${match.id}`);
                    console.log(`   - Token in URL: ${match.url.split('/').pop()}`);
                    console.log(`   - Expected Token: ${item.expectedToken}`);
                } else {
                    console.log(`NO EXACT MATCH for "${item.name}". Top result:`);
                    const top = data.data.results[0];
                    console.log(`   - Name: ${top.name} | ID: ${top.id} | URL: ${top.url}`);
                }
            } else {
                console.log(`NO RESULTS for "${item.name}"`);
            }
        } catch (e) {
            console.log(`ERROR verifying "${item.name}": ${e.message}`);
        }
    }
}

verify();
