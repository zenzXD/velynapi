import { API_KEY, CREATOR } from "../../settings";
import { getAllRequestCounts, trackRequest } from "../../redis";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    try {
        await trackRequest("/api/stats");
        await trackRequest("/api/ai/saanviAI");
        await trackRequest("/api/ai/magicStudio");
        await trackRequest("/api/downloader/instagram");

        const totalRequest = await getAllRequestCounts();

        if (Object.keys(totalRequest).length === 0) {
            return res.status(200).json({
                status: true,
                creator: CREATOR,
                message: "No request data available",
                totalRequest: {},
            });
        }

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
