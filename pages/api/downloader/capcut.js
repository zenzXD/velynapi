import { CREATOR } from "../../../settings";
import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method tidak dapat berfungsi. Gunakan metode GET.",
        });
    }

    const { url } = req.query;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "URL tidak valid atau kosong.",
        });
    }

    try {
        const data = await capcutdl(url);

        if (!data || typeof data === "string") {
            throw new Error("Gagal mengambil data dari URL.");
        }

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
            error: error.message || "Terjadi kesalahan pada server.",
        });
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

async function capcutdl(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);

        return {
            title: $(".detail .title").text().trim() ||
                   $(".template-title-wrapper .template-title").text().trim() ||
                   "No Title",
            author: {
                avatar: $(".toC_info img").attr("src") ||
                        $(".author img").attr("src") ||
                        "No Author Avatar",
                name: $(".toC_info .name").text().trim() ||
                      $(".author .author-name").text().trim() ||
                      "No Author Name",
            },
            videoUrl: $("video").attr("src") || "No Video",
        };
    } catch (error) {
        console.error("Error saat mengambil data:", error.message);
        return { error: error.message };
    }
}
