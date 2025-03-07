import { API_KEY, CREATOR } from "../../../settings";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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
        const imageBuffer = await text2image(prompt);

        if (!imageBuffer) {
            return res.status(500).json({
                status: false,
                creator: CREATOR,
                error: "Failed to retrieve image",
            });
        }

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

async function text2image(prompt) {
    try {
        const taskId = uuidv4();
        const payload = {
            orientation: "square",
            prompt: prompt,
            task_id: taskId,
        };

        await axios.post("https://magichour.ai/api/free-tools/v1/ai-image-generator", payload);

        let result = null;
        let retries = 15; // Batas retry agar tidak infinite loop
        let delay = 2000; // 2 detik

        while (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));

            const res = await axios.get(`https://magichour.ai/api/free-tools/v1/ai-image-generator/${taskId}/status`);
            result = res.data;

            if (result.status === "SUCCESS" && result.image_url) {
                break;
            }

            retries--;
        }

        if (!result || result.status !== "SUCCESS" || !result.image_url) {
            throw new Error("Image URL not found or generation failed");
        }

        // Unduh gambar sebagai buffer
        const imageResponse = await axios.get(result.image_url, {
            responseType: "arraybuffer",
        });

        return imageResponse.data;
    } catch (error) {
        throw new Error(`Gagal menghasilkan gambar: ${error.message}`);
    }
}
