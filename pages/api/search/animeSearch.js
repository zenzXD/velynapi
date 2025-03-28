import axios from "axios";
import * as cheerio from "cheerio";

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
        const data = await nontonAnime.search(query);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data.length ? data : "No results found",
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

const base = {
    latest: "https://nontonanime.live/",
    orderAnime: "https://nontonanime.live/anime/?status&type&order",
    search: "https://nontonanime.live/?s=",
};

const nontonAnime = {
    search: async (q) => {
        try {
            const { data } = await axios.get(base.search + encodeURIComponent(q), {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            });

            const $ = cheerio.load(data);
            const searchResults = [];

            $(".bsx").each((_, element) => {
                const title = $(element).find("a").attr("title")?.trim();
                const url = $(element).find("a").attr("href");
                const episode = $(element).find(".bt .epx").text().trim();
                const type = $(element).find(".limit .typez").text().trim();
                const thumbnail =
                    $(element).find(".lazyload").attr("data-src") ||
                    $(element).find("img").attr("src");

                if (title && url) {
                    searchResults.push({ title, url, episode, type, thumbnail });
                }
            });

            return searchResults;
        } catch (error) {
            console.error("Error fetching search results:", error);
            return [];
        }
    },
};
