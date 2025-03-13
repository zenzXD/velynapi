import axios from "axios";
import cheerio from "cheerio";
import { CREATOR } from "../../../settings";

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
        const imageUrl = await getImageUrl(prompt);
        if (!imageUrl) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "No image found",
            });
        }

        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.setHeader("Content-Type", "image/jpeg");
        res.send(Buffer.from(imageResponse.data, 'binary'));
    } catch (error) {
        console.error("Error generating image:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function getImageUrl(query) {
    const searchUrl = `https://prompthero.com/search?q=${encodeURIComponent(query)}`;

    try {
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);
        
        const imageUrls = $('img').map((_, element) => {
            const src = $(element).attr('src');
            return src && (src.startsWith('http') || src.startsWith('//')) 
                ? src.startsWith('//') ? `https:${src}` : src
                : null;
        }).get();

        return imageUrls.length > 0 ? imageUrls[0] : null;
    } catch (error) {
        console.error('Error scraping PromptHero:', error.message);
        return null;
    }
}
