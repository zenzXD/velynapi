import axios from "axios";
import { CREATOR } from "../../../settings.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { text } = req.query;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Parameter 'text' wajib diisi",
        });
    }

    try {
        const imageUrl = `https://rioo-brat.apibotwa.biz.id?text=${encodeURIComponent(text)}`;
        const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", data.length);
        return res.status(200).send(data);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}
