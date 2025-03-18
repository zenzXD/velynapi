import axios from "axios";
import cheerio from "cheerio";
import qs from "qs";
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
            error: "Parameter 'url' diperlukan",
        });
    }

    try {
        const data = await douyin(url);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: JSON.parse(JSON.stringify(data)), 
        });
    } catch (error) {
        console.error("Error fetching Douyin data:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function douyin(url) {
    try {
        const formData = qs.stringify({
            q: url,
            lang: "id",
            cftoken: "",
        });

        const { data } = await axios.post("https://tikvideo.app/api/ajaxSearch", formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept": "*/*",
                "X-Requested-With": "XMLHttpRequest",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
                "Referer": "https://tikvideo.app/id/download-douyin-video",
            },
        });

        if (!data || !data.data) {
            throw new Error("Gagal mengambil data media dari sumber.");
        }

        const $ = cheerio.load(data.data);
        const downloadLinks = [];

        $("a.tik-button-dl").each((i, el) => {
            const link = $(el).attr("href");
            const format = $(el).text().trim();
            if (link) {
                downloadLinks.push({ format, url: link });
            }
        });

        const thumbnail = $(".image-tik img").attr("src") || null;
        const title = $("h3").text().trim() || "Tidak ada judul";

        return {
            title,
            thumbnail,
            downloadLinks, // Biarkan dalam array objek yang benar
        };
    } catch (error) {
        console.error("Error saat memproses Douyin:", error.message);
        return {
            status: false,
            message: error.message,
        };
    }
}
