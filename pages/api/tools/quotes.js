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

    try {
        const data = await quotes();
        if (!data) {
            throw new Error("Failed to fetch quote");
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function quotes() {
    try {
        const response = await axios.get("https://quotes.toscrape.com/random", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(response.data);
        const quoteText = $(".quote .text").text().trim();
        const author = $(".quote .author").text().trim();
        const tags = $(".quote .tags .tag")
            .map((_, el) => $(el).text().trim())
            .get();

        if (!quoteText || !author) {
            throw new Error("Invalid response structure");
        }

        return {
            quote: quoteText,
            author: author,
            tags: tags,
        };
    } catch (error) {
        console.error("Error fetching quote:", error.message);
        throw error;
    }
}
