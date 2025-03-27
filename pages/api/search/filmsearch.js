import axios from "axios";
import * as cheerio from "cheerio";
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
        const data = await search(query);
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

async function search(judul) {
    try {
        const url = `https://www.rgregorycolvinlaw.com/?s=${encodeURIComponent(judul)}`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $("#content.gmr-content article.item-infinite").each((i, el) => {
            const titleElement = $(el).find(".entry-header h2.entry-title a");
            const title = titleElement.text().trim();
            const link = titleElement.attr("href")?.trim();
            const image = $(el).find(".content-thumbnail a img").attr("src")?.trim() || "";
            const rating = $(el).find(".gmr-rating-item").text().trim() || "N/A";

            if (title && link) {
                results.push({ title, link, image, rating });
            }
        });

        return results.length > 0 ? results : [{ message: "No results found" }];
    } catch (error) {
        console.error("Error scraping search results:", error.message);
        return [];
    }
}
