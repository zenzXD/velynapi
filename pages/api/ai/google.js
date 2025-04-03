import axios from "axios";
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
    if (!prompt) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Missing query parameter",
        });
    }
    
    try {
        const chatResponse = await chatGptD(prompt);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: chatResponse.response,
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function chatGptD(prompt) {
    try {
        const response = await axios.post("https://chat.chatgptdemo.net/chat_api_stream", {
            question: query,
            chat_id: "679c11d40c3719b6c7916bfd",
            timestamp: Date.now()
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "PostmanRuntime/7.29.0",
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "Host": "chat.chatgptdemo.net",
                "Origin": "https://chat.chatgptdemo.net",
                "Referer": "https://chat.chatgptdemo.net/"
            },
            responseType: "stream"
        });

        let res = "";
        await new Promise((resolve, reject) => {
            response.data.on("data", chunk => {
                const lines = chunk.toString().split("\n");
                lines.forEach(line => {
                    const match = line.match(/"content":\s*"([^"]*)"/);
                    if (match) {
                        res += match[1];
                    }
                });
            });
            response.data.on("end", resolve);
            response.data.on("error", reject);
        });

        return { response: res.trim() };
    } catch (error) {
        console.error("Error fetching chat response:", error);
        return { response: "Error fetching response" };
    }
}
