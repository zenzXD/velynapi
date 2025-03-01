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

    const { id } = req.query;  
    if (!id) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "ID Free Fire tidak boleh kosong",
        });
    }

    try {
        const data = await ffStalk(id);

        if (!data || Object.keys(data).length === 0) {
            return res.status(404).json({
                status: false,
                creator: CREATOR,
                error: "Data tidak ditemukan atau ID tidak valid",
            });
        }

        res.status(200).json({
            status: true,
            creator: CREATOR,
            data: data,
        });
    } catch (error) {
        console.error("Error fetching Free Fire data:", error.message);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Terjadi kesalahan saat mengambil data Free Fire",
        });
    }
}

async function ffStalk(id) {
    try {
        let formdata = new FormData();
        formdata.append("uid", id);

        let response = await axios.post(
            "https://tools.freefireinfo.in/profileinfo.php?success=1",
            formdata,
            {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "origin": "https://tools.freefireinfo.in",
                    "referer": "https://tools.freefireinfo.in/profileinfo.php?success=1",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
                },
            }
        );

        // Cek apakah respons dari server valid
        if (!response || !response.data) {
            throw new Error("Gagal mendapatkan respons dari server");
        }

        const $ = cheerio.load(response.data);
        let tr = $("div.result").html()?.split("<br>");

        if (!tr || tr.length < 27) {
            throw new Error("Format data berubah atau ID tidak valid");
        }

        return {
            name: tr[0]?.split("Name: ")[1] || "Unknown",
            bio: tr[14]?.split(": ")[1] || "No bio",
            like: parseInt(tr[2]?.split(": ")[1]) || 0,
            level: parseInt(tr[3]?.split(": ")[1]) || 0,
            exp: parseInt(tr[4]?.split(": ")[1]) || 0,
            region: tr[5]?.split(": ")[1] || "Unknown",
            honorScore: parseInt(tr[6]?.split(": ")[1]) || 0,
            brRank: tr[7]?.split(": ")[1] || "Unknown",
            brRankPoint: parseInt(tr[8]?.split(": ")[1]) || 0,
            csRankPoint: parseInt(tr[9]?.split(": ")[1]) || 0,
            accountCreated: tr[10]?.split(": ")[1] || "Unknown",
            lastLogin: tr[11]?.split(": ")[1] || "Unknown",
            preferMode: tr[12]?.split(": ")[1] || "Unknown",
            language: tr[13]?.split(": ")[1] || "Unknown",
            booyahPassPremium: tr[16]?.split(": ")[1] === "Yes",
            booyahPassLevel: parseInt(tr[17]?.split(": ")[1]) || 0,
            petInformation: {
                name: tr[20]?.split(": ")[1] || "No pet",
                level: parseInt(tr[21]?.split(": ")[1]) || 0,
                exp: parseInt(tr[22]?.split(": ")[1]) || 0,
                starMarked: tr[23]?.split(": ")[1] === "Yes",
                selected: tr[24]?.split(": ")[1] === "Yes",
            },
            guild: tr[26] || "No guild",
            equippedItems: $(".equipped-items .equipped-item")
                .map((i, e) => ({
                    name: $(e).find("p").text().trim(),
                    img: $(e).find("img").attr("src"),
                }))
                .get(),
        };
    } catch (error) {
        console.error("Error parsing Free Fire data:", error.message);
        return null;
    }
}
