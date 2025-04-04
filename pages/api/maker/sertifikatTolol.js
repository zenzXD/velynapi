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
        const imageUrl = `https://api.siputzx.my.id/api/m/sertifikat-tolol?text=${encodeURIComponent(text)}`;
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

        if (!response.data || response.status !== 200) {
            return res.status(500).json({
                status: false,
                creator: CREATOR,
                error: "Gagal mengambil gambar dari API eksternal",
            });
        }

        const imageBuffer = Buffer.from(response.data);

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", imageBuffer.length);
        res.status(200).send(imageBuffer);

    } catch (error) {
        console.error("Error fetching image:", error.message);

        let errorMessage = "Internal Server Error";
        if (error.response) {
            errorMessage = `Error from server: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            errorMessage = "No response received from server";
        }

        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: errorMessage,
        });
    }
}
