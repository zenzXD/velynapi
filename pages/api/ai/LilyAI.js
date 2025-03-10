import axios from "axios";
import FormData from "form-data";
import cheerio from "cheerio";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { prompt } = req.query;

    if (!prompt || prompt.trim() === "") {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Missing or empty 'prompt' parameter",
        });
    }

    try {
        const data = await chatbot(prompt);
        return res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error processing request:", error.response?.data || error.message);
        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
            details: error.response?.data || error.message,
        });
    }
}

async function getNonceNihSuki() {
    try {
        const { data } = await axios.get("https://chatbotai.one");
        const $ = cheerio.load(data);
        const nonce = $(".wpaicg-chat-shortcode").attr("data-nonce");
        return nonce || null;
    } catch (error) {
        console.error("Failed to fetch nonce:", error.response?.data || error.message);
        return null;
    }
}

async function chatbot(prompt) {
    try {
        const nonceNihSuki = await getNonceNihSuki();

        if (!nonceNihSuki) {
            throw new Error("Nonce tidak ditemukan!");
        }

        const d = new FormData();
        d.append("_wpnonce", nonceNihSuki);
        d.append("post_id", 11);
        d.append("url", "https://chatbotai.one");
        d.append("action", "wpaicg_chat_shortcode_message");
        d.append("message", prompt);
        d.append("bot_id", 0);

        const headers = {
            headers: {
                ...d.getHeaders(),
            },
        };

        const { data } = await axios.post("https://chatbotai.one/wp-admin/admin-ajax.php", d, headers);
        return data;
    } catch (error) {
        console.error("Chatbot API error:", error.response?.data || error.message);
        throw new Error("Failed to fetch response from chatbot API");
    }
}
