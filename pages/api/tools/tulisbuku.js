import { API_KEY, CREATOR } from "../../../settings";
import axios from "axios";
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ status: false, error: "Method Not Allowed" });
    }

    let { text, size = "24", color = "#000000" } = req.query;

    if (!text) {
        return res.status(400).json({ status: false, error: "Missing required parameter: text" });
    }

    try {
        const filePath = await generateBook({ text, size, color });
        const imageBuffer = await fs.readFile(filePath);

        res.status(200).setHeader("Content-Type", "image/jpeg").send(imageBuffer);
    } catch (error) {
        res.status(500).json({ status: false, error: "Internal Server Error" });
    }
}

async function generateBook({ text, size, color }) {
    const payload = { color, font: "Small Memory", size, text };

    try {
        const response = await axios.post("https://lemon-write.vercel.app/api/generate-book", payload, { responseType: "arraybuffer" });

        const fileName = `nulis_${Date.now()}.jpg`;
        const filePath = path.join(process.cwd(), "public/generated", fileName);

        await fs.writeFile(filePath, response.data);
        return filePath;
    } catch (error) {
        throw error;
    }
}
