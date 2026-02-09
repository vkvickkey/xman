export const removeSourceAttribution = (text) => {
    if (!text) return "";
    // 1. Decode HTML entities
    let decoded = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'");

    // 2. Remove (From "...") entirely
    // Matches (From "Movie") or (From Movie)
    let cleaned = decoded.replace(/\s*\(From\s+.*?\)/gi, "");

    return cleaned.trim();
};

export const getAlbumFromTitle = (text) => {
    if (!text) return null;
    let decoded = text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'");

    const match = decoded.match(/\(From\s+"(.*?)"\)/i) || decoded.match(/\(From\s+(.*?)\)/i);
    return match ? match[1] : null;
};
