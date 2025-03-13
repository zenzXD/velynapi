import axios from "axios";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ status: false, creator: CREATOR, error: "Method Not Allowed" });
    }

    const { prompt } = req.query;
    if (!prompt) {
        return res.status(400).json({ status: false, creator: CREATOR, error: "Missing 'prompt' parameter" });
    }

    try {
        // Pisahkan prompt menjadi title, slogan, dan idea (gunakan "|" sebagai pemisah)
        const [title, slogan, idea] = prompt.split("|").map((item) => item.trim());

        // Dapatkan URL gambar dari API
        const imageUrl = await getLogoImageUrl({ title, slogan, idea });
        if (!imageUrl) throw new Error("Failed to retrieve image URL");

        // Ambil gambar langsung dari URL yang diberikan API
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

        // Tentukan format gambar berdasarkan content-type yang dikembalikan API
        const contentType = imageResponse.headers["content-type"] || "image/png";

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Length", imageResponse.data.length);
        res.status(200).send(imageResponse.data);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ status: false, creator: CREATOR, error: "Internal Server Error", details: error.message });
    }
}

async function getLogoImageUrl({ title = "", slogan = "", idea = "" }) {
    try {
        const payload = {
            ai_icon: [333276, 333279],
            height: 300,
            idea,
            industry_index: "N",
            industry_index_id: "",
            pagesize: 4,
            session_id: "",
            slogan,
            title,
            whiteEdge: 80,
            width: 400,
        };

        const response = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload);

        // Validasi respons API
        const logos = response?.data?.data?.logoList;
        if (!Array.isArray(logos) || logos.length === 0) throw new Error("Invalid API response");

        return logos[0].logo_thumb; // Ambil URL gambar pertama
    } catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to generate logo");
    }
}
