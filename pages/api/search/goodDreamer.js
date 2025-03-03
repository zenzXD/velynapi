import axios from "axios";
import { CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { query, limit = 10 } = req.query; // Ambil query dan berikan nilai default pada limit

    if (!query) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required",
        });
    }

    try {
        const data = await goodDreamer.search(query, limit);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

const goodDreamer = {
    search: async (query, limit = 10) => {
        try {
            const response = await axios.get(
                `https://api.gooddreamer.id/api/web/novels/?q=${encodeURIComponent(query)}&limit=${limit}&page=1`
            );
            return response.data?.data || []; // Pastikan data tidak undefined
        } catch (error) {
            console.error("API request failed:", error.message);
            throw new Error("Failed to fetch data from GoodDreamer API");
        }
    },
};
