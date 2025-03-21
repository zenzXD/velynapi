import axios from "axios";
import cheerio from "cheerio";
import { CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required",
        });
    }

    try {
        const data = await ypsearch(query);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

function encodeUrl(url) {
    return encodeURIComponent(url);
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

        $(".video-box").each((i, el) => {
            const title = $(el).find(".video-title").text().trim() || "No title found";
            const videoPath = $(el).find("a").attr("href");
            const url = videoPath ? `https://www.youporn.com${videoPath}` : "No URL";
            const thumbnail = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "No thumbnail";
            const duration = $(el).find(".video-duration").text().trim() || "No duration";

            results.push({ title, url, thumbnail, duration });
        });

        console.log(results.length > 0 ? results : "No results found");
        return results.length > 0 ? results : [];
    } catch (error) {
        console.error("Error:", error.message);
        return [];
    }
}
