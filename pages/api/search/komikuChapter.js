import axios from 'axios';
import * as cheerio from 'cheerio';
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            status: false,
            creator: CREATOR,
            error: "Method Not Allowed",
        });
    }

    const { link } = req.query;
    
    try {
        const data = await fetchKomikuData(link);
        res.status(200).json({
            status: true,
            creator: CREATOR,
            data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            creator: CREATOR,
            error: error.message || "Internal Server Error",
        });
    }
}

async function fetchKomikuData(link) {
    if (!link) throw new Error("Parameter link is required");

    if (link.startsWith('https://') || link.startsWith('http://')) {
        const startIndex = link.indexOf('/', link.indexOf('//') + 2);
        link = startIndex !== -1 ? link.substring(startIndex + 1) : link;
    }

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    };

    const response = await axios.get(`https://komiku.id/${link}`, { headers });
    const html = response.data;
    const $ = cheerio.load(html);

    const images = $('#Baca_Komik img').map((_, el) => $(el).attr('src')).get();

    const info = {};
    $('tbody[data-test="informasi"] tr').each((index, element) => {
        const tdElements = $(element).find('td');
        if (tdElements.length >= 2) {
            const value = $(tdElements[1]).text().trim();
            if (index === 0) info.title = value;
            if (index === 1) info.releaseDate = value;
            if (index === 2) info.readingDirection = value;
        }
    });

    return {
        info,
        images,
        nextChapter: $('.content .nextch').attr('data') || null,
    };
}
