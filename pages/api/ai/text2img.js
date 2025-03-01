import { CREATOR } from "../../../settings";
import axios from 'axios';

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
        const imageBuffer = await text2img(prompt);

        if (!imageBuffer) {
            return res.status(500).json({
                status: false,
                creator: CREATOR,
                error: "Failed to generate image",
            });
        }

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", imageBuffer.length);
        res.status(200).send(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function text2img(prompt, size = 512) {
    try {
        const { data } = await axios.post(
            'https://ftvwohriusaknrzfogjh.supabase.co/functions/v1/generate-image',
            {
                "prompt": `${prompt}, professional photograph, raw photo, unedited photography, photorealistic, 8k uhd, high quality dslr photo, sharp focus, detailed, crystal clear, natural lighting`,
                "width": size,
                "height": size
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dndvaHJpdXNha25yemZvZ2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNDc1NDMsImV4cCI6MjA0OTkyMzU0M30.JXPW9daK9AEov4sOt83qOgvx43-hE6QYfdO0h-nUHSs",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dndvaHJpdXNha25yemZvZ2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNDc1NDMsImV4cCI6MjA0OTkyMzU0M30.JXPW9daK9AEov4sOt83qOgvx43-hE6QYfdO0h-nUHSs"
                }
            }
        );

        if (!data.image) {
            throw new Error("Image data not found");
        }

        let base64Image = data.image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        return Buffer.from(base64Image, 'base64');
    } catch (error) {
        console.error("Error generating image:", error.message);
        return null;
    }
}