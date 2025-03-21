import { API_KEY, CREATOR } from "../../../settings";
import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { url } = req.query;

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Invalid or missing URL parameter",
        });
    }

    try {
        const data = await teraboxdl(url);

        if (data.status === "error") {
            return res.status(400).json({
                status: false,
                creator: CREATOR,
                error: data.message,
            });
        }

        return res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Server Error:", error);

        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function teraboxdl(url) {
    try {
        const apiUrl = `https://teraboxdownloaderonline.com/api/download-m3u8?terabox_link=${encodeURIComponent(url)}`;

        const headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
            "Referer": `https://teraboxdownloaderonline.com/player?url=${encodeURIComponent(url)}`,
        };

        const response = await axios.get(apiUrl, { headers });

        if (!response.data || typeof response.data !== "string") {
            throw new Error("Invalid response from API");
        }

        const match = response.data.match(/#EXTINF:\d+,\s*(https[^\s]+)/);
        if (match && match[1]) {
            return {
                status: "success",
                video_url: match[1],
            };
        } else {
            return {
                status: "error",
                message: "Video URL tidak ditemukan.",
            };
        }
    } catch (error) {
        console.error("Terabox Download Error:", error.message);

        return {
            status: "error",
            message: "Terjadi kesalahan saat mengambil data.",
            error: error.message,
        };
    }
}
