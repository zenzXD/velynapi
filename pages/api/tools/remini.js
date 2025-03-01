import { CREATOR } from "../../../settings";
import FormData from "form-data";
import Jimp from "jimp";
import fetch from "node-fetch"; 

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
            error: "Bad Request: Missing 'prompt' parameter",
        });
    }

    try {
        const imageBuffer = await fetchImage(url);
        if (!imageBuffer) throw new Error("Failed to fetch image");

        const processedImage = await processing(imageBuffer, method);

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Length", processedImage.length);
        res.status(200).send(processedImage);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function fetchImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Image download failed");

        return Buffer.from(await response.arrayBuffer());
    } catch (error) {
        console.error("Error fetching image:", error);
        return null;
    }
}

async function processing(imageBuffer, method) {
    return new Promise((resolve, reject) => {
        const Methods = ["enhance", "recolor", "dehaze"];
        method = Methods.includes(method) ? method : Methods[0];

        const Form = new FormData();
        const scheme = `https://inferenceengine.vyro.ai/${method}`;

        Form.append("model_version", "1", {
            "Content-Transfer-Encoding": "binary",
            contentType: "multipart/form-data; charset=utf-8",
        });

        Form.append("image", imageBuffer, {
            filename: "enhance_image_body.jpg",
            contentType: "image/jpeg",
        });

        Form.submit(
            {
                url: scheme,
                host: "inferenceengine.vyro.ai",
                path: `/${method}`,
                protocol: "https:",
                headers: {
                    "User-Agent": "okhttp/4.9.3",
                    Connection: "Keep-Alive",
                    "Accept-Encoding": "gzip",
                },
            },
            (err, res) => {
                if (err) return reject(err);

                let data = [];
                res.on("data", (chunk) => data.push(chunk))
                   .on("end", () => resolve(Buffer.concat(data)))
                   .on("error", (e) => reject(e));
            }
        );
    });
}