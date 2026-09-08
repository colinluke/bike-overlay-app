export const searchYouTube = async (query) => {
    if (!query) return [];

    try {
        const cleanQuery = encodeURIComponent(query).replace(/%20/g, "+");
        const localUrl = "/api/yt?search_query=" + cleanQuery;

        const response = await fetch(localUrl);
        if (!response.ok) throw new Error("Local proxy failure");

        const htmlText = await response.text();

        const idRegex = /"videoId":"([^"]+)"/g;
        const titleRegex = /"title":{"runs":\[{"text":"([^"]+)"/g;

        const idMatches = [...htmlText.matchAll(idRegex)];
        const titleMatches = [...htmlText.matchAll(titleRegex)];

        const results = [];
        const seen = new Set();

        for (let i = 0; i < idMatches.length; i++) {
            // 🛠️ FIX: Changed the variable name from idMatches to a clean, isolated 'id'
            const id = idMatches[i] && idMatches[i][1] ? idMatches[i][1] : null;
            const title = titleMatches[i] && titleMatches[i][1] ? titleMatches[i][1] : "YouTube Video";

            // Now your check for 'id' references the correct variable!
            if (id && !seen.has(id)) {
                seen.add(id);
                results.push({ id, title });
            }
            if (results.length >= 6) break;
        }

        return results;
    } catch (error) {
        console.error("YouTube scraper exception:", error);
        return [];
    }
};