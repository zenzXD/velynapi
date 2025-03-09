import { CREATOR } from "../../../settings.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "URL parameter is required",
        });
    }

    try {
        const data = await ytdlz(url);
        if (data.error) {
            return res.status(400).json({
                status: false,
                creator: CREATOR,
                error: data.error,
            });
        }

        return res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error fetching YouTube data:", error.message || error);
        return res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

// Fungsi untuk mendapatkan ID video dari URL YouTube
const getIdYoutube = (url) => {
    try {
        const urlObj = new URL(url);
        const { hostname, pathname, searchParams } = urlObj;

        if (hostname === "youtu.be") return pathname.substring(1);
        if (hostname.includes("youtube.com")) {
            if (searchParams.has("v")) return searchParams.get("v");
            const match = pathname.match(/\/(embed|shorts)\/([^/?]+)/);
            if (match) return match[2];
        }

        throw new Error("Invalid YouTube URL");
    } catch {
        return null;
    }
};

// Fungsi untuk mendapatkan data YouTube
const ytdlz = async (urlYt) => {
    const id = getIdYoutube(urlYt);
    if (!id) return { error: "Invalid YouTube video ID" };

    const payload = JSON.stringify({ u: id });
    const headers = {
        "Content-Type": "application/json",
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://yt-downloaderz.com/",
        "Origin": "https://yt-downloaderz.com/",
    };

    try {
        const response = await fetch("https://dl.yt-downloaderz.com/info", {
            method: "POST",
            headers,
            body: payload,
        });

        if (!response.ok) {
            return { error: "Failed to fetch data from downloader API" };
        }

        const data = await response.json();

        if (!data || !data.basicInfo || !data.advancedInfo) {
            return { error: "Invalid response from downloader API" };
        }

        return {
            basicInfo: {
                type: data.basicInfo.type || null,
                videoId: data.basicInfo.videoId || null,
                url: data.basicInfo.url || null,
                title: data.basicInfo.title || "Unknown Title",
                description: data.basicInfo.description || "No description",
                image: data.basicInfo.image || null,
                thumbnail: data.basicInfo.thumbnail || null,
                duration: data.basicInfo.duration?.timestamp || "Unknown",
                views: data.basicInfo.views ? data.basicInfo.views.toLocaleString() : "Unknown",
                uploaded: data.basicInfo.ago || "Unknown",
                author: {
                    name: data.basicInfo.author?.name || "Unknown",
                    url: data.basicInfo.author?.url || null,
                },
            },
            advancedInfo: {
                id: data.advancedInfo.id || null,
                title: data.advancedInfo.title || "Unknown",
                videoMp4: data.advancedInfo.videoOptions?.mp4?.[0]?.url || null,
                audioMp3: data.advancedInfo.audioOptions?.[0] || null,
                image: data.advancedInfo.image || null,
            },
        };
    } catch (error) {
        console.error("Error in ytdlz function:", error.message || error);
        return { error: "Failed to retrieve video data" };
    }
}
