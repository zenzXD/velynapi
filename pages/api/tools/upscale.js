import { CREATOR } from "../../../settings";
import FormData from "form-data";
import axios from "axios";
import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { url } = req.query;

    if (!url || !isValidImageUrl(url)) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Bad Request: Invalid or missing 'url' parameter (must be image link)",
        });
    }

    try {
        const imageBuffer = await fetchImage(url);
        const hdImageBuffer = await upscaleImage(imageBuffer);

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", hdImageBuffer.length);
        return res.status(200).send(hdImageBuffer);
    } catch (err) {
        console.error("Upscale Error:", err.message);
        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: err.message || "Internal Server Error",
        });
    }
}

// Cek validasi URL gambar
function isValidImageUrl(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
}

// Fetch image dari URL
async function fetchImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image from URL");
    return await response.buffer();
}

// Proses upscale ke resolusi tinggi
async function upscaleImage(imageBuffer) {
    const form = new FormData();
    form.append("desiredHeight", "3172");
    form.append("desiredWidth", "4096");
    form.append("anime", "false");
    form.append("outputFormat", "png");
    form.append("colorMode", "RGB");
    form.append("compressionLevel", "High");
    form.append("image_file", imageBuffer, {
        filename: "upload.jpg",
        contentType: "image/jpeg",
    });

    const response = await axios.post("https://api.upscalepics.com/upscale-free", form, {
        headers: {
            ...form.getHeaders(),
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://upscalepics.com",
            "Referer": "https://upscalepics.com/",
        },
    });

    if (!response.data?.output_url) {
        throw new Error("Upscaling failed, no output received");
    }

    const output = await fetch(response.data.output_url);
    if (!output.ok) throw new Error("Failed to fetch HD image result");
    return await output.buffer();
}
