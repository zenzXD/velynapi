import cheerio from "cheerio";
import fetch from "node-fetch";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { text } = req.query;

    if (!text || text.trim() === "") {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Text parameter is required",
        });
    }

    try {
        const data = await generateTextImage(text);
        if (!data || data.length === 0) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "No result found",
            });
        }
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function generateTextImage(text) {
    try {
        const response = await fetch("https://www.picturetopeople.org/p2p/text_effects_generator.p2p/transparent_text_effect", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
            },
            body: new URLSearchParams({
                TextToRender: text,
                FontSize: "100",
                Margin: "30",
                LayoutStyle: "0",
                TextRotation: "0",
                TextColor: "ffffff",
                TextTransparency: "0",
                OutlineThickness: "3",
                OutlineColor: "000000",
                FontName: "Lekton",
                ResultType: "view",
            }).toString(),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const bodyText = await response.text();
        const $ = cheerio.load(bodyText);
        const resultFile = $('#idResultFile').attr('value');
        const refTS = $('#idRefTS').attr('value');

        if (!resultFile || !refTS) {
            throw new Error("Failed to extract image URL");
        }

        return [{ url: `https://www.picturetopeople.org${resultFile}`, title: refTS }];
    } catch (error) {
        console.error("Error in generateTextImage:", error);
        return [];
    }
}
