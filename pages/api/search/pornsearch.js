import axios from "axios";
import cheerio from "cheerio";
import { CREATOR } from "../../../settings";

export default async function handler(req, res) {
    // Memastikan metode yang digunakan adalah POST
    if (req.method !== "POST") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    // Mengambil query dari body request
    const { query } = req.body;

    // Validasi query
    if (typeof query !== "string" || query.trim().length === 0) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required and must be a non-empty string.",
        });
    }

    try {
        // Melakukan pencarian dengan query yang diberikan
        const data = await ypsearch(query);

        // Mengembalikan hasil pencarian
        res.status(200).json({
            status: true,
            creator: CREATOR,
            total_results: data.length,
            data,
        });
    } catch (error) {
        console.error("YouPorn Search Error:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal server error. Please try again later.",
        });
    }
}

// Fungsi untuk meng-encode URL
function encodeUrl(url) {
    return encodeURIComponent(url);
}

// Fungsi untuk melakukan pencarian di YouPorn
async function ypsearch(query) {
    try {
        const url = `https://www.youporn.com/search/`;
        const { data } = await axios.post(url, null, {
            params: {
                query: encodeURIComponent(query),
            },
            headers: {
                "User -Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Referer": "https://www.youporn.com/",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        const $ = cheerio.load(data);
        const results = [];

        // Mengambil informasi video dari hasil pencarian
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
