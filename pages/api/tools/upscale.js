import { CREATOR } from "../../../settings";
import FormData from "form-data";
import axios from "axios";
import fetch from "node-fetch"; // pastikan fetch tersedia

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { url, method = "enhance" } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Bad Request: Missing 'url' parameter",
        });
    }

    try {
        const imageBuffer = await fetchImage(url);
        if (!imageBuffer) throw new Error("Failed to fetch image");

        const hdImageBuffer = await processing(imageBuffer, method);
        if (!hdImageBuffer) throw new Error("Failed to process image");

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", hdImageBuffer.length);
        res.status(200).send(hdImageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: error.message || "Internal Server Error",
        });
    }
}

async function fetchImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Image fetch failed");
    return await response.buffer();
}

async function processing(imageBuffer, method) {
    if (method !== "enhance") {
        throw new Error(`Unsupported method: ${method}`);
    }

    const form = new FormData();
    form.append("desiredHeight", "3172");
    form.append("desiredWidth", "4096");
    form.append("anime", "false");
    form.append("outputFormat", "png");
    form.append("colorMode", "RGB");
    form.append("compressionLevel", "High");
    form.append("image_file", imageBuffer, {
        filename: "input.jpg",
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
        throw new Error("Upscaling failed: No output URL received");
    }

    const outputImage = await fetch(response.data.output_url);
    if (!outputImage.ok) throw new Error("Failed to fetch output image");

    return await outputImage.buffer();
}
