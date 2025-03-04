import { validateApiKey } from "../../../apikeyy.js";
import { CREATOR } from "../../../settings.js";
import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    return validateApiKey(req, res, async () => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                creator: CREATOR,
                error: "URL is required",
            });
        }

        try {
            const data = await ytmp3.process(url);
            if (!data) throw new Error("Gagal mengonversi video menjadi MP3");

            res.status(200).json({
                status: true,
                creator: CREATOR,
                input: url,
                output: data.downloadUrl,
                title: data.title,
                thumbnail: data.thumbnail,
            });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({
                status: false,
                creator: CREATOR,
                error: `Internal Server Error: ${error.message}`,
            });
        }
    });
}

const GetIdYoutube = async (url) => {
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        if (!videoId) throw new Error("ID video tidak ditemukan dalam URL");
        return videoId;
    } catch (error) {
        console.error("Terjadi kesalahan:", error.message);
        return null;
    }
};

const ytmp3 = {
    getInfo: async (url) => {
        try {
            const idYt = await GetIdYoutube(url);
            if (!idYt) throw new Error("Gagal mendapatkan ID video");

            const { data } = await axios.get(
                `https://c01-h01.cdnframe.com/api/v4/info/${idYt}`
            );

            return data;
        } catch (error) {
            console.error("Terjadi kesalahan saat mengambil info:", error.message);
            return null;
        }
    },

    convert: async (token) => {
        try {
            const { data } = await axios.post(
                "https://c01-h01.cdnframe.com/api/v4/convert",
                { token },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Safari/537.36",
                    },
                }
            );

            return data;
        } catch (error) {
            console.error("Terjadi kesalahan saat konversi:", error.message);
            return null;
        }
    },

    process: async (url) => {
        try {
            const info = await ytmp3.getInfo(url);
            if (!info) throw new Error("Gagal mendapatkan informasi video");

            const { title, thumbnail, formats } = info;
            if (!formats?.audio?.mp3?.length)
                throw new Error("Format audio tidak tersedia");

            const token = formats.audio.mp3[0].token;
            const convertData = await ytmp3.convert(token);
            if (!convertData?.id) throw new Error("Gagal melakukan konversi");

            const { data } = await axios.get(
                `https://c01-h01.cdnframe.com/api/v4/status/${convertData.id}`
            );

            return {
                title,
                thumbnail,
                downloadUrl: data.url,
            };
        } catch (error) {
            console.error("Terjadi kesalahan saat memproses:", error.message);
            return null;
        }
    },
};
