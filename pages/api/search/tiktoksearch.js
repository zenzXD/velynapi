import axios from 'axios';
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required",
        });
    }

    try {
        const data = await tiktokSearch(query);
        return res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Error fetching TikTok data:", error.message);
        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: error.message || "Internal Server Error",
        });
    }
}

async function tiktokSearch(query) {
    try {
        const response = await axios.post(
            "https://tikwm.com/api/feed/search",
            new URLSearchParams({
                keywords: query,
                count: 10,
                cursor: 0,
                HD: 1,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Cookie: "current_language=en",
                    "User-Agent":
                        "Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
                },
            }
        );

        const result = response.data;
        const videos = result.data?.videos || [];

        if (!videos.length) {
            throw new Error("No videos found.");
        }

        return videos.map((v) => ({
            title: v.title,
            cover: v.cover,
            origin_cover: v.origin_cover,
            link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`,
            no_watermark: v.play,
            watermark: v.wmplay,
            music: v.music_info,
            views: v.play_count,
            likes: v.digg_count,
            comments: v.comment_count || 0,
            shares: v.share_count || 0,
            downloads: v.download_count || 0,
            saves: v.collect_count || 0,
            created_at: new Date(v.create_time * 1000).toISOString(),
        }));
    } catch (error) {
        throw new Error(`Failed to fetch TikTok data: ${error.message}`);
    }
}
