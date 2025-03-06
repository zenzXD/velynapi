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

    const { q } = req.query;

    if (!q) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required",
        });
    }

    try {
        const data = await YahooImg(q);
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
            error: "Internal Server Error",
        });
    }
}

async function YahooImg(query) {
    try {
        const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}&ei=UTF-8`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let result = [];

        $("div.sres-cntr ul#sres > li").each((index, element) => {
            const imageData = JSON.parse($(element).attr("data"));
            if (imageData) {
                result.push({
                    title: imageData.alt || "No title",
                    size: imageData.s,
                    width: imageData.w,
                    height: imageData.h,
                    url: imageData.iurl,
                });
            }
        });

        return result.length > 0 ? result : { error: "No images found" };
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        throw new Error("Failed to fetch image data");
    }
}
