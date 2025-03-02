import axios from "axios";
import cheerio from "cheerio";
import { CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    // Mengambil parameter query dari URL
    const query = req.query.query?.trim(); // Trim untuk menghapus spasi berlebih

    // Validasi input query
    if (!query) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Bad Request: Missing or invalid 'query' parameter",
        });
    }

    try {
        const data = await jadwalSholat(query);
        if (!data || Object.keys(data).length === 0) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "Data not found",
            });
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error("Error fetching jadwal sholat:", error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: `Internal Server Error: ${error.message}`,
        });
    }
}

async function jadwalSholat(kota) {
    try {
        // Encode nama kota agar URL valid
        const formattedKota = encodeURIComponent(kota.replace(/\s+/g, "-").replace(/\./g, ""));
        const url = `https://jadwal-imsakiyah.tirto.id/${formattedKota}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);

        // Ambil data waktu sholat utama
        let waktuSholat = {
            imsak: $('b.font59').eq(0).text().trim(),
            subuh: $('b.font59').eq(1).text().trim(),
            dzuhur: $('b.font59').eq(2).text().trim(),
            ashar: $('b.font59').eq(3).text().trim(),
            maghrib: $('b.font59').eq(4).text().trim(),
            isya: $('b.font59').eq(5).text().trim(),
            all: []
        };

        // Ambil data tabel jadwal lengkap
        $('.table-content-sholat').each((i, e) => {
            const tanggal = $(e).find('td').eq(0).text().trim();
            if (!tanggal) return; // Lewati jika tidak ada data

            waktuSholat.all.push({
                tanggal,
                jadwal: {
                    imsak: $(e).find('td').eq(1).text().trim(),
                    subuh: $(e).find('td').eq(2).text().trim(),
                    dzuhur: $(e).find('td').eq(3).text().trim(),
                    ashar: $(e).find('td').eq(4).text().trim(),
                    maghrib: $(e).find('td').eq(5).text().trim(),
                    isya: $(e).find('td').eq(6).text().trim()
                }
            });
        });

        // Cek jika data tidak ditemukan
        if (!waktuSholat.imsak || waktuSholat.all.length === 0) {
            throw new Error("Jadwal sholat tidak ditemukan untuk kota tersebut.");
        }

        return waktuSholat;
    } catch (error) {
        console.error("Error in jadwalSholat:", error);
        throw new Error("Gagal mengambil data jadwal sholat.");
    }
}

async function searchCity(q) {
    try {
        const { data } = await axios.get(`https://jadwal-imsakiyah.tirto.id/cities?q=${encodeURIComponent(q)}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
            }
        });

        if (!data || data.length === 0) {
            throw new Error("Kota tidak ditemukan.");
        }

        return data;
    } catch (error) {
        console.error("Error in searchCity:", error);
        throw new Error("Gagal mencari kota.");
    }
}
