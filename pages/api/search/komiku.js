import axios from "axios";
import * as cheerio from "cheerio";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { title } = req.query;
    if (!title) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Title parameter is required",
        });
    }

    try {
        const data = await komiku(title);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
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

async function komiku(title) {
    const response = await axios.get(`https://api.komiku.id/?post_type=manga&s=${title}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        }
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    $("div.bge").each((_, element) => {
        const bgei = $(element).find("div.bgei");
        const link = bgei.find("a").attr("href") || "";
        const thumb = bgei.find("a img").attr("src") || "";
        const tpe1_inf = bgei.find("div.tpe1_inf");
        const type = tpe1_inf.find("b").text().trim();
        const genre = tpe1_inf.text().replace(type, "").trim();
        const kan = $(element).find("div.kan");
        const mangaTitle = kan.find("span.judul2").text().trim();
        const description = kan.find("p").text().trim();
        const new1Elements = kan.find("div.new1");
        const firstChp = {
            link: new1Elements.first().find("a").attr("href") || "",
            title: new1Elements.first().find("span").last().text().trim()
        };
        const lastChp = {
            link: new1Elements.last().find("a").attr("href") || "",
            title: new1Elements.last().find("span").last().text().trim()
        };

        results.push({
            title: mangaTitle,
            link,
            thumb,
            type,
            genre,
            description,
            firstChp,
            lastChp
        });
    });
    
    return results;
}
