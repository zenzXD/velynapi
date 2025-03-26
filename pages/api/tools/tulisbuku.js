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

    const { prompt } = req.query;

    if (!prompt) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Bad Request: Missing 'prompt' parameter",
        });
    }

    try {
        const imageBuffer = await generateBook(prompt);

        // Kirim gambar langsung sebagai respons
        res.setHeader("Content-Type", "image/jpeg");
        res.send(imageBuffer);
    } catch (error) {
        console.error("Error generating image:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function generateBook(prompt) {
    const payload = {
        color: "#000000",
        font: "arch",
        size: 25, 
        text: prompt, 
    };

    const { data } = await axios.post("https://lemon-write.vercel.app/api/generate-book", payload, {
        responseType: "arraybuffer",
    });

    return Buffer.from(data); 
}
