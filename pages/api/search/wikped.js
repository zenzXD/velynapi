//BabyBotz MultiDevice
import * as cheerio from "cheerio";
import { CREATOR } from "../../../settings";
import fetch from "node-fetch";

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
            error: "Bad Request: Missing 'query' parameter",
        });
    }

    try {
        const data = await Wikipedia(query);
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
            error: `Internal Server Error: ${error.message}`,
        });
    }
}

async function Wikipedia(query) {
    try {
        const url = `https://id.wikipedia.org/wiki/${encodeURIComponent(query)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Halaman tidak ditemukan (${response.status})`);

        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $("#firstHeading").text().trim();
        if (!title) throw new Error("Judul tidak ditemukan.");
        const description = $("#mw-content-text p")
            .filter((_, el) => $(el).text().trim().length > 0)
            .first()
            .text()
            .trim();

        if (!description) throw new Error("Deskripsi tidak ditemukan.");
        let imageUrl = $(".infobox img").first().attr("src") || $("img.mw-file-element").first().attr("src");
        const fullImageUrl = imageUrl ? `https:${imageUrl.replace(/\/\d+px-/, "/800px-")}` : null;

        return {
            title,
            description,
            imageUrl: fullImageUrl,
            link: url,
        };
    } catch (error) {
        console.error("Error:", error.message);
        throw new Error(`Gagal mengambil data: ${error.message}`);
    }
}
