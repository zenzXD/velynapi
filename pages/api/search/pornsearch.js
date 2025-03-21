import puppeteer from "puppeteer";
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

    if (!query || query.trim().length === 0) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required.",
        });
    }

    try {
        const data = await ypsearch(query);

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,  // Menggunakan `data` sesuai Swagger
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
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    try {
        const url = `https://www.youporn.com/search/?query=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: "domcontentloaded" });

        const results = await page.evaluate(() => {
            const videos = [];
            document.querySelectorAll(".video-box").forEach(el => {
                const title = el.querySelector(".video-title")?.innerText.trim() || "No title";
                const videoPath = el.querySelector("a")?.getAttribute("href");
                const url = videoPath ? `https://www.youporn.com${videoPath}` : null;
                const thumbnail = el.querySelector("img")?.getAttribute("data-src") || el.querySelector("img")?.getAttribute("src") || "No thumbnail";
                const duration = el.querySelector(".video-duration")?.innerText.trim() || "Unknown";

                if (url) {
                    videos.push({ title, duration, thumbnail, url });
                }
            });
            return videos;
        });

        await browser.close();
        return results;
    } catch (error) {
        await browser.close();
        console.error("YouPorn Scraper Error:", error);
        return [];
    }
  }
