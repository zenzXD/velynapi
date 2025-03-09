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

    const { q } = req.query;

    if (!q) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required",
        });
    }

    try {
        const data = await getSongLyrics(q);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
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

async function getSongLyrics(query) {
    const url = `http://song-lyrics-api-o0m8tth8t-azharimm.vercel.app/search?q=${encodeURIComponent(query)}`;

    try {
        const { data } = await axios.get(url);

        if (!data.status || !data.data) {
            return { error: "No results found" };
        }

        return data.data.map(song => ({
            songId: song.songId,
            artist: song.artist,
            songTitle: song.songTitle,
            songLyricsUrl: song.songLyrics
        }));
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        throw new Error("Failed to fetch song lyrics");
    }
}
