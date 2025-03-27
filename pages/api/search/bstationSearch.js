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
        const data = await BSearch(query);
        if (data.length === 0) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "No results found",
            });
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function BSearch(query) {
    try {
        const url = `https://www.bilibili.tv/id/search-result?q=${encodeURIComponent(query)}`;
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(html);
        const results = [];

        $("li.section__list__item").each((index, element) => {
            const title = $(element).find(".bstar-video-card__title").text().trim() || "No title available";
            const videoLink = $(element).find(".bstar-video-card__cover-link").attr("href") || "";
            const thumbnail = $(element).find(".bstar-video-card__cover-img img").attr("src") || "";
            const views = $(element).find(".bstar-video-card__desc--normal").text().trim() || "No views";
            const creatorName = $(element).find(".bstar-video-card__nickname").text().trim() || "Unknown creator";
            const creatorLink = $(element).find(".bstar-video-card__nickname").attr("href") || "";
            const duration = $(element).find(".bstar-video-card__cover-mask-text").text().trim() || "Unknown duration";

            if (videoLink) {
                results.push({
                    title,
                    videoLink: `https://www.bilibili.tv${videoLink}`,
                    thumbnail,
                    views,
                    creatorName,
                    creatorLink: creatorLink ? `https://www.bilibili.tv${creatorLink}` : "",
                    duration
                });
            }
        });

        return results.length > 0 ? results : [{ message: "No results found" }];
    } catch (error) {
        console.error("Error while fetching search results:", error);
        return [];
    }
}
