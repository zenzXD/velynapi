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

    const { q, page, url } = req.query;

    try {
        if (q) {
            const data = await searchAntaraNews(q, page || 1);
            return res.status(200).json({
                status: true,
                creator: CREATOR,
                data,
            });
        }

        if (url) {
            const data = await getDetailNews(url);
            return res.status(200).json({
                status: true,
                creator: CREATOR,
                data,
            });
        }

        const data = await getLatestNews();
        return res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function requestAntara(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                referer: "https://www.google.com/",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            },
        });
        return cheerio.load(data);
    } catch (error) {
        console.error("Error fetching the URL:", error.message);
        throw new Error("Failed to fetch data from Antara News");
    }
}

async function getLatestNews() {
    const $ = await requestAntara("https://www.antaranews.com");
    let result = [];

    $(".wrapper__list__article .mb-3").each((i, e) => {
        const title = $(e).find(".card__post__title").text().trim() || "No Title";
        const uploaded = $(e).find(".list-inline-item").text().trim() || "Unknown Date";
        let url = $(e).find(".card__post__title a").attr("href");
        const img = $(e).find("img").attr("data-src") || $(e).find("img").attr("src") || "default-image.jpg";

        if (url && !url.startsWith("http")) url = `https://www.antaranews.com${url}`;

        result.push({ title, uploaded, url, img });
    });

    return result.length ? result : { error: "No news found" };
}

async function searchAntaraNews(query, page = 1) {
    const $ = await requestAntara(`https://www.antaranews.com/search?q=${encodeURIComponent(query)}&page=${page}`);
    let result = [];

    $(".wrapper__list__article .card__post").each((i, e) => {
        const title = $(e).find("h2.h5").text().trim() || "No Title";
        const uploaded = $(e).find(".list-inline-item").text().trim() || "Unknown Date";
        let url = $(e).find("h2.h5 a").attr("href");
        const img = $(e).find("img").attr("data-src") || $(e).find("img").attr("src") || "default-image.jpg";
        const description = $(e).find("p").text().trim() || "No Description";

        if (url && !url.startsWith("http")) url = `https://www.antaranews.com${url}`;

        result.push({ title, uploaded, url, img, description });
    });

    return result.length ? result : { error: "No results found" };
}

async function getDetailNews(url) {
    const $ = await requestAntara(url);
    
    const title = $(".wrap__article-detail-title").text().trim() || "No Title";
    const img = $("img.img-fluid").attr("src") || "default-image.jpg";
    const date = $(".wrap__article-detail-info .list-inline-item").eq(0).text().trim() || "Unknown Date";
    const readDuration = $(".wrap__article-detail-info .list-inline-item").eq(1).text().trim() || "Unknown Duration";
    
    let tags = [];
    $(".blog-tags a").each((i, e) => {
        tags.push({ tag: $(e).text().trim(), url: $(e).attr("href") || "#" });
    });

    let content = [];
    $(".wrap__article-detail-content p").each((i, e) => {
        const paragraph = $(e).text().trim();
        if (paragraph) content.push(paragraph);
    });

    return { title, img, date, readDuration, tags, content };
}
