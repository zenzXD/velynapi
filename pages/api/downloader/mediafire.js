import axios from "axios";
import cheerio from "cheerio";
import mime from "mime-types";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Missing 'url' parameter",
        });
    }

    try {
        const data = await MediaFire(url);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error fetching MediaFire data:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: error.message || "Internal Server Error",
        });
    }
}

async function MediaFire(url, retries = 5, delay = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(proxyUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.178 Safari/537.36"
                },
            });

            const $ = cheerio.load(data);

            const filename = $(".dl-btn-label").attr("title") || "unknown_file";
            const ext = filename.split(".").pop();
            const mimetype = mime.lookup(ext) || `application/${ext}`;

            const sizeMatch = $(".input.popsok").text().trim().match(/\(([^)]+)\)/);
            const size = sizeMatch ? sizeMatch[1] : "Unknown";

            const downloadUrl = ($("#downloadButton").attr("href") || "").trim();
            const alternativeUrl = ($("#download_link > a.retry").attr("href") || "").trim();

            if (!downloadUrl && !alternativeUrl) {
                throw new Error("No valid download link found.");
            }

            return {
                filename,
                size,
                mimetype,
                link: downloadUrl || alternativeUrl,
                alternativeUrl,
            };
        } catch (error) {
            console.warn(`Attempt ${attempt} failed: ${error.message}`);

            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error("Failed to fetch data after multiple attempts");
            }
        }
    }
}
