export const removeSourceAttribution = (text) => {
    if (!text) return "";
    // Replace (From "Source") with (Source)
    // Example: Raavana Mavandaa (From "Jana Nayagan") -> Raavana Mavandaa (Jana Nayagan)
    let formatted = text.replace(/\(From\s+(?:&quot;|"|')?(.*?)(?:&quot;|"|')?\)/gi, "($1)");
    return formatted.trim();
};
