export const removeSourceAttribution = (text) => {
    if (!text) return "";
    // Removes content in parentheses starting with "From", "Feat", "Live", "Remix" etc if needed
    // The user specifically asked to remove "(From "Jana Nayagan")"
    // We will target (From "...") and potentially just any (From ...)
    return text.replace(/\(From.*?\)/gi, "").trim();
};
