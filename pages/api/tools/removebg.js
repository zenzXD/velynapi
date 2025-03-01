import { validateApiKey } from "../../../apikeyy.js";
import { CREATOR } from "../../../settings.js";
import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    try {
        await validateApiKey(req, res, async () => {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({
                    status: false,
                    creator: CREATOR,
                    error: "Bad Request: Missing 'url' parameter",
                });
            }

            try {
                const imageBuffer = await removebg(url);

                if (!imageBuffer || !(imageBuffer instanceof Buffer)) {
                    return res.status(500).json({
                        status: false,
                        creator: CREATOR,
                        error: "Internal Server Error: Invalid image buffer response",
                    });
                }

                res.setHeader("Content-Type", "image/png");
                res.setHeader("Content-Length", imageBuffer.length);
                res.status(200).send(imageBuffer);

            } catch (error) {
                console.error("Error generating image:", error);
                res.status(500).json({
                    status: false,
                    creator: CREATOR,
                    error: "Internal Server Error",
                });
            }
        });
    } catch (error) {
        console.error("API Key validation error:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function removebg(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary').toString('base64');

        let res;
        try {
            res = await axios.post(
                "https://us-central1-ai-apps-prod.cloudfunctions.net/restorePhoto",
                {
                    image: `data:image/png;base64,${imageBuffer}`,
                    model: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
                }
            );
        } catch (error) {
            throw new Error("Error while calling removebg API: " + error.message);
        }

        const data = res.data;
        if (!data || typeof data !== "string") {
            throw new Error("Invalid response from removebg API");
        }

        const finalImageBuffer = Buffer.from(data, "base64");
        return finalImageBuffer;
    } catch (error) {
        console.error("Error in removebg:", error);
        throw new Error("Error in removebg: " + error.message);
    }
}