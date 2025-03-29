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

  const { url: detailsQuery } = req.query;

  if (!detailsQuery) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      error: "Query parameter is required",
    });
  }

  // Validasi apakah URL yang diberikan valid
  try {
    new URL(detailsQuery);
  } catch {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      error: "Invalid URL format",
    });
  }

  try {
    const data = await nontonAnime.details(detailsQuery);

    if (!data) {
      return res.status(404).json({
        status: false,
        creator: CREATOR,
        error: "Details not found",
      });
    }

    res.status(200).json({
      status: true,
      creator: CREATOR,
      data,
    });
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({
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
      const { data } = await axios.get(base.latest);
      const $ = cheerio.load(data);
      const animeList = [];

      $(".listupd.normal .bsx a").each((_, element) => {
        animeList.push({
          title: $(element).attr("title") || "Unknown",
          url: $(element).attr("href") || "#",
          episode: $(element).find(".bt .epx").text().trim() || "N/A",
          type: $(element).find(".limit .typez").text().trim() || "Unknown",
          thumbnail:
            $(element).find(".lazyload").attr("data-src") ||
            $(element).find("img").attr("src") ||
            "No Image",
        });
      });

      return animeList;
    } catch (error) {
      console.error("Error fetching latest anime:", error);
      return [];
    }
  },

  upcoming: async () => {
    try {
      const { data } = await axios.get(base.orderAnime);
      const $ = cheerio.load(data);
      const upcomingList = [];

      $(".listupd .bsx a").each((_, element) => {
        const episode = $(element).find(".bt .epx").text().trim();

        if (episode.toLowerCase() === "upcoming") {
          upcomingList.push({
            title: $(element).attr("title") || "Unknown",
            url: $(element).attr("href") || "#",
            episode,
            type: $(element).find(".limit .typez").text().trim() || "Unknown",
            thumbnail:
              $(element).find(".lazyload").attr("data-src") ||
              $(element).find("img").attr("src") ||
              "No Image",
          });
        }
      });

      return upcomingList;
    } catch (error) {
      console.error("Error fetching upcoming anime:", error);
      return [];
    }
  },

  search: async (q) => {
    try {
      const { data } = await axios.get(base.search + encodeURIComponent(q));
      const $ = cheerio.load(data);
      const searchResults = [];

      $(".bsx a").each((_, element) => {
        searchResults.push({
          title: $(element).attr("title") || "Unknown",
          url: $(element).attr("href") || "#",
          episode: $(element).find(".bt .epx").text().trim() || "N/A",
          type: $(element).find(".limit .typez").text().trim() || "Unknown",
          thumbnail:
            $(element).find(".lazyload").attr("data-src") ||
            $(element).find("img").attr("src") ||
            "No Image",
        });
      });

      return searchResults;
    } catch (error) {
      console.error("Error fetching search results:", error);
      return [];
    }
  },

  details: async (url) => {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $("h1.entry-title").text().trim() || "Unknown";
      const thumbnail =
        $(".bigcover .lazyload").attr("data-src") ||
        $(".bigcover img").attr("src") ||
        "No Image";
      const synopsis = $(".entry-content p").text().trim() || "No synopsis available";
      const status = $(".info-content .spe span:contains('Status')")
        .text()
        .replace("Status:", "")
        .trim() || "Unknown";
      const studio = $(".info-content .spe span:contains('Studio') a")
        .text()
        .trim() || "Unknown";
      const season = $(".info-content .spe span:contains('Season') a")
        .text()
        .trim() || "Unknown";
      const type = $(".info-content .spe span:contains('Type')")
        .text()
        .replace("Type:", "")
        .trim() || "Unknown";

      const genres = $(".genxed a")
        .map((_, el) => $(el).text().trim())
        .get() || [];

      const characters = $(".cvlist .cvitem")
        .map((_, el) => {
          const charName = $(el).find(".cvchar .charname").text().trim() || "Unknown";
          const voiceActor = $(el).find(".cvactor .charname a").text().trim() || "Unknown";
          return { charName, voiceActor };
        })
        .get();

      const episodes = $(".eplister ul li")
        .map((_, el) => {
          const episodeKe = $(el).find(".epl-num").text().trim() || "Unknown";
          const title = $(el).find(".epl-title").text().trim() || "Unknown";
          const dateOfRelease = $(el).find(".epl-date").text().trim() || "Unknown";
          const link = $(el).find("a").attr("href") || "#";
          return { episodeKe, title, dateOfRelease, link };
        })
        .get();

      return {
        title,
        thumbnail,
        synopsis,
        status,
        studio,
        season,
        type,
        genres,
        characters,
        episodes,
      };
    } catch (error) {
      console.error("Error fetching anime details:", error);
      return null;
    }
  }
};
