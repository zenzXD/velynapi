import axios from "axios";
import FormData from "form-data";
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
            error: "Missing or empty 'text' parameter",
        });
    }

    try {
        const data = await chatbot(prompt);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error processing request:", error.response?.data || error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
            details: error.response?.data || error.message,
        });
    }
}

async function chatbot(ask) {
    try {
        const formData = new FormData();
        formData.append("_wpnonce", "b39f1c06da");
        formData.append("post_id", "11");
        formData.append("url", "https://chatbotai.one");
        formData.append("action", "wpaicg_chat_shortcode_message");
        formData.append("message", ask);
        formData.append("bot_id", "0");

        const headers = {
            ...formData.getHeaders(),
        };

        const response = await axios.post("https://chatbotai.one/wp-admin/admin-ajax.php", formData, { headers });

        return response.data;
    } catch (error) {
        console.error("Chatbot API error:", error.response?.data || error.message);
        throw new Error("Failed to fetch response from chatbot API");
    }
}
