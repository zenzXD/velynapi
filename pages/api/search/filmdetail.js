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

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Parameter 'url' harus disertakan.",
        });
    }

    try {
        const data = await filmdetail(url);
        return res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function filmdetail(link) {
    try {
        if (!link.startsWith("http")) {
            throw new Error("URL tidak valid.");
        }

        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        const title = $('.entry-header h1.entry-title').text().trim() || "Tidak ditemukan";
        const thumbnail = $('.gmr-movie-data.clearfix figure.pull-left img').attr('src')?.trim() || "Tidak ditemukan";
        const synopsis = $('.entry-content.entry-content-single p').first().text().trim() || "Tidak tersedia";
        const downloadLinks = [];

        $('.entry-content.entry-content-single ul.list-inline.gmr-download-list.clearfix li a').each((i, el) => {
            const quality = $(el).text().trim();
            const downloadUrl = $(el).attr('href')?.trim();
            if (downloadUrl) {
                downloadLinks.push({ quality, downloadUrl });
            }
        });

        return {
            title,
            thumbnail,
            synopsis,
            downloadLinks: downloadLinks.length > 0 ? downloadLinks : "Tidak ada link download.",
        };
    } catch (error) {
        console.error("Error scraping detail:", error.message);
        return { error: "Gagal mengambil detail film." };
    }
}
