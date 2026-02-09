/**
 * Utility to extract singer and music director names from artists data.
 * @param {Object} artistsData - The artists object from the song data.
 * @returns {Object} - An object containing singer and musicDirector strings.
 */
export const getArtistMetadata = (artistsData) => {
    if (!artistsData) {
        return {
            singer: "Unknown Artist",
            musicDirector: "Unknown Director",
            singleLine: "Unknown Artist"
        };
    }

    const primary = artistsData.primary || [];

    // Extract composers (music directors)
    const composerRoles = ['composer', 'music director', 'music'];
    const composers = primary
        .filter(a => composerRoles.includes(a.role?.toLowerCase()))
        .map(a => a.name);

    // Extract singers — exclude those who are ONLY composers
    const singerRoles = ['singer', 'primary', 'primary_artists', ''];
    const singers = primary
        .filter(a => {
            const role = (a.role || '').toLowerCase();
            // Include if role suggests singer OR no role at all
            // But exclude if role is exclusively a composer-type
            return (
                singerRoles.includes(role) ||
                !composerRoles.includes(role)
            );
        })
        .map(a => a.name);

    // Remove duplicates while preserving order
    const uniqueSingers = [...new Set(singers)];
    const uniqueComposers = [...new Set(composers)];

    const singer = uniqueSingers.length > 0
        ? uniqueSingers.join(", ")
        : "Unknown Artist";

    const musicDirector = uniqueComposers.length > 0
        ? uniqueComposers.join(", ")
        : "Unknown Director";

    // Build singleLine: avoid repeating the same name in both parts
    let singleLine = singer;
    if (musicDirector !== "Unknown Director" && musicDirector !== singer) {
        singleLine += ` | ${musicDirector}`;
    }

    return { singer, musicDirector, singleLine };
};