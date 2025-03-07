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
        let taskId = uuidv4();
        let payload = {
            orientation: "square",
            prompt: prompt,
            task_id: taskId,
        };

        await axios.post("https://magichour.ai/api/free-tools/v1/ai-image-generator", payload);

        let result;
        let retries = 15; // Batas retry untuk menghindari loop tak terbatas

        do {
            if (retries-- <= 0) {
                throw new Error("Timeout: Image generation took too long");
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));
            let res = await axios.get(`https://magichour.ai/api/free-tools/v1/ai-image-generator/${taskId}/status`);
            result = res.data;
        } while (result.status !== "SUCCESS");

        if (!result.image_url) {
            throw new Error("Image URL not found in response");
        }

        // Mengunduh gambar sebagai buffer
        const imageResponse = await axios.get(result.image_url, {
            responseType: "arraybuffer",
        });

        return imageResponse.data;
    } catch (error) {
        throw new Error(`Gagal menghasilkan gambar: ${error.message}`);
    }
  }
