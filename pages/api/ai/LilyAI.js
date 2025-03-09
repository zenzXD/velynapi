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

    const { text } = req.query;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Missing 'text' parameter",
        });
    }

    try {
        const data = await chatbot(text);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Error processing request:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function chatbot(ask) {
   let d = new FormData();
   d.append("_wpnonce", "b39f1c06da")
   d.append("post_id", 11);
   d.append("url", "https://chatbotai.one");
   d.append("action", "wpaicg_chat_shortcode_message");
   d.append("message", ask);
   d.append("bot_id", 0)
   let headers = {
      headers: {
         ...d.getHeaders()
      }
   }
   let { data } = await axios.post("https://chatbotai.one/wp-admin/admin-ajax.php", d, headers)
   return data
}
