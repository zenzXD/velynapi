import axios from "axios";
import * as cheerio from "cheerio";
import { CREATOR } from "../../../settings";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      creator: CREATOR,
      error: "Method Not Allowed",
    });
  }

  try {
    const latestAnime = await nontonAnime.latest();

    if (!latestAnime.length) {
      return res.status(404).json({
        status: false,
        creator: CREATOR,
        error: "No latest anime found",
      });
    }

    return res.status(200).json({
      status: true,
      creator: CREATOR,
      latestAnime,
    });
  } catch (error) {
    console.error("Error fetching latest anime:", error);
    return res.status(500).json({
      status: false,
      creator: CREATOR,
      error: "Internal Server Error",
    });
  }
}

const base = {
  latest: "https://nontonanime.live/",
  orderAnime: "https://nontonanime.live/anime/?status&type&order",
  search: "https://nontonanime.live/?s="
};

const nontonAnime = {
  latest: async () => {
    try {
      const { data } = await axios.get(base.latest, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });
      const $ = cheerio.load(data);
      const animeList = [];

      $(".listupd.normal .bsx").each((_, element) => {
        const title = $(element).find("a").attr("title")?.trim() || "Unknown";
        const url = $(element).find("a").attr("href") || "#";
        const episode = $(element).find(".bt .epx").text().trim() || "N/A";
        const type = $(element).find(".limit .typez").text().trim() || "Unknown";
        const thumbnail =
          $(element).find(".lazyload").attr("data-src") ||
          $(element).find("img").attr("src") ||
          "No Image";
        
        // 🔥 Perbaikan untuk `releaseDate`
        let releaseDate = $(element).find(".bt .date").text().trim();
        if (!releaseDate || releaseDate === "") {
          releaseDate = "Tanggal Tidak Diketahui"; // Gunakan fallback yang lebih jelas
        }

        animeList.push({
          title,
          url,
          episode,
          type,
          thumbnail,
          releaseDate
        });
      });

      return animeList;
    } catch (error) {
      console.error("Error fetching latest anime:", error);
      return [];
    }
  }
};
