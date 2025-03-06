import axios from "axios";
import FormData from "form-data";
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

    const { url } = req.query;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Invalid URL",
        });
    }

    try {
        const data = await scdl(url);

        if (!data.audio) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "Failed to retrieve audio",
            });
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error fetching SoundCloud data:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
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

async function scdl(url) {
    try {
        let formData = new FormData();
        formData.append("url", url);

        let { data } = await axios.post("https://soundcloudmp3.co/result.php", formData, {
            headers: {
                ...formData.getHeaders(),
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            timeout: 10000, 
          });

        let $ = cheerio.load(data);
        let title = $(".text-2xl").text().trim() || null;
        let artwork = $(".first-div img").attr("src") || null;
        let audio = $("audio source").attr("src") || null;

        return { title, artwork, audio };
    } catch (error) {
        console.error("Error in scdl function:", error.message);
        return { title: null, artwork: null, audio: null };
    }
}
