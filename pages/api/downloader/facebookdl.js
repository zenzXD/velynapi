import axios from "axios";
import { CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { url } = req.query;
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Invalid or missing URL",
        });
    }

    try {
        const data = await fetchFacebookVideo(url);
        if (!data.status) {
            return res.status(500).json({
                status: false,
                creator: CREATOR,
                error: data.error || "Failed to fetch video",
            });
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data.data,
        });
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: error.message || "Internal Server Error",
        });
    }
}

async function fetchFacebookVideo(url) {
    try {
        const response = await axios.post(
            "https://contentstudio.io/.netlify/functions/facebookdownloaderapi",
            { url },
            {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
                    "Referer": "https://contentstudio.io/tools/free-facebook-downloader"
                }
            }
        );

        return {
            status: true,
            data: response.data
        };
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return {
            status: false,
            error: error.message || "Unknown error"
        };
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
