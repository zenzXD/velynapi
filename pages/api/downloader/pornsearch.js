import axios from "axios";
import cheerio from "cheerio";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { query } = req.query;

    if (!query || query.trim().length === 0) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required.",
        });
    }

    try {
        const data = await ypsearch(query);

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "No results found.",
            });
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            results: data,
        });
    } catch (error) {
        console.error("YouPorn Search Error:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal server error.",
        });
    }
}

async function ypsearch(query) {
    try {
        const url = `https://www.youporn.com/search/?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);
        const results = [];

        $(".video-box").each((_, el) => {
            const title = $(el).find(".video-title").text().trim() || "No title available";
            const videoPath = $(el).find("a").attr("href");
            const url = videoPath ? `https://www.youporn.com${videoPath}` : null;
            const thumbnail = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || null;
            const duration = $(el).find(".video-duration").text().trim() || "Unknown";

            if (url && thumbnail) {
                results.push({ title, url, thumbnail, duration });
            }
        });

        return results;
    } catch (error) {
        console.error("YouPorn Search Error:", error.message);
        return { error: "Failed to fetch search results." };
    }
}
