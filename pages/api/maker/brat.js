import { CREATOR } from "../../../settings.js";
import { createCanvas, registerFont } from "@napi-rs/canvas";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import os from "os";

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
            error: "Parameter 'text' tidak boleh kosong!",
        });
    }

    try {
        const buffer = await BratGenerator(text);
        res.setHeader("Content-Type", "image/png");
        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: "Internal Server Error",
        });
    }
}

async function BratGenerator(teks) {
    try {
        if (!teks) throw new Error("Teks tidak boleh kosong!");

        const width = 512;
        const height = 512;
        const margin = 20;
        const wordSpacing = 50;
        const fontURL = "https://files.catbox.moe/nseqid.ttf";

        // Simpan font di folder sementara sistem
        const fontPath = path.join(os.tmpdir(), "temp_font.ttf");

        console.log("🔄 Mengunduh font...");
        const { data } = await axios.get(fontURL, { responseType: "arraybuffer" });
        await fs.writeFile(fontPath, data);
        console.log("✅ Font berhasil diunduh!");

        // Daftarkan font
        registerFont(fontPath, { family: "Narrow" });

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Latar belakang putih
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        let fontSize = 280;
        const lineHeightMultiplier = 1.3;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "black";
        ctx.font = `${fontSize}px Narrow`;

        const words = teks.split(" ");
        let lines = [];

        function rebuildLines() {
            lines = [];
            let currentLine = "";

            for (let word of words) {
                let testLine = currentLine ? `${currentLine} ${word}` : word;
                let lineWidth = ctx.measureText(testLine).width + (currentLine.split(" ").length - 1) * wordSpacing;

                if (lineWidth < width - 2 * margin) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }
        }

        rebuildLines();

        while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
            fontSize -= 2;
            ctx.font = `${fontSize}px Narrow`;
            rebuildLines();
        }

        const lineHeight = fontSize * lineHeightMultiplier;
        let y = margin;

        for (const line of lines) {
            const wordsInLine = line.split(" ");
            let x = margin;

            for (const word of wordsInLine) {
                ctx.fillText(word, x, y);
                x += ctx.measureText(word).width + wordSpacing;
            }
            y += lineHeight;
        }

        const buffer = canvas.toBuffer("image/png");

        // Hapus font setelah digunakan
        await fs.unlink(fontPath);
        console.log("🗑️ Font berhasil dihapus!");

        return buffer;
    } catch (error) {
        console.error("Error:", error.message);
        throw new Error("Gagal membuat gambar.");
    }
}
