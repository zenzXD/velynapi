import { API_KEY, CREATOR } from "../../settings";
import { getAllRequestCounts } from "../../redis.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }
  
    try {
        const totalRequest = await getAllRequestCounts();
        res.status(200).json({
            status: true,
            creator: CREATOR,
            totalRequest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}
