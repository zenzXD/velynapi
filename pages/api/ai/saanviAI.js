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

    const { text } = req.query;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Missing 'text' parameter",
        });
    }

    try {
        const data = await saanvi(text);
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

async function saanvi(text) {
    const payload = {
        messages: [
            {
                content: text,
                role: "user",
            },
        ],
    };

    try {
        const response = await axios.post("https://ai.riple.org/", payload, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            responseType: "stream",
        });

        return new Promise((resolve, reject) => {
            let fullResponse = "";
            let isResolved = false; // Flag untuk memastikan resolve hanya sekali

            response.data.on("data", (chunk) => {
                let lines = chunk.toString().split("\n");

                for (let line of lines) {
                    if (line.startsWith("data: ")) {
                        let jsonString = line.slice(6).trim();

                        if (jsonString === "[DONE]" && !isResolved) {
                            isResolved = true;
                            return resolve({ result: fullResponse.trim() });
                        }

                        try {
                            let parsedData = JSON.parse(jsonString);
                            let content = parsedData?.choices?.[0]?.delta?.content;

                            if (content) {
                                fullResponse += content;
                            }
                        } catch (err) {
                            console.error("JSON parsing error:", err);
                            if (!isResolved) {
                                isResolved = true;
                                reject(new Error("Invalid JSON response"));
                            }
                        }
                    }
                }
            });

            response.data.on("end", () => {
                if (!isResolved) {
                    isResolved = true;
                    resolve({ result: fullResponse.trim() });
                }
            });

            response.data.on("error", (err) => {
                console.error("Stream error:", err);
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error("Request failed:", error.message);
        throw new Error("Failed to fetch AI response");
    }
}
