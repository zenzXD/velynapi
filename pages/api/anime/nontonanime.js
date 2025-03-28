import axios from "axios";
import * as cheerio from "cheerio";

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
          title: $(element).attr("title"),
          url: $(element).attr("href"),
          episode: $(element).find(".bt .epx").text().trim(),
          type: $(element).find(".limit .typez").text().trim(),
          thumbnail: $(element).find(".lazyload").attr("data-src") || $(element).find("img").attr("src"),
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
            title: $(element).attr("title"),
            url: $(element).attr("href"),
            episode,
            type: $(element).find(".limit .typez").text().trim(),
            thumbnail: $(element).find(".lazyload").attr("data-src") || $(element).find("img").attr("src"),
          });
        }
      });

      return upcomingList;
    } catch (error) {
      console.error("Error fetching upcoming anime:", error);
      return [];
    }
  },

  search: async (query) => {
    try {
      const { data } = await axios.get(base.search + encodeURIComponent(query));
      const $ = cheerio.load(data);
      const searchResults = [];

      $(".bsx a").each((_, element) => {
        searchResults.push({
          title: $(element).attr("title"),
          url: $(element).attr("href"),
          episode: $(element).find(".bt .epx").text().trim(),
          type: $(element).find(".limit .typez").text().trim(),
          thumbnail: $(element).find(".lazyload").attr("data-src") || $(element).find("img").attr("src"),
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

      const title = $("h1.entry-title").text().trim();
      const thumbnail = $(".bigcover .lazyload").attr("data-src") || $(".bigcover img").attr("src");
      const synopsis = $(".entry-content p").text().trim();
      const status = $(".info-content .spe span:contains('Status')").text().replace("Status:", "").trim();
      const studio = $(".info-content .spe span:contains('Studio') a").text().trim();
      const season = $(".info-content .spe span:contains('Season') a").text().trim();
      const type = $(".info-content .spe span:contains('Type')").text().replace("Type:", "").trim();
      
      const genres = $(".genxed a").map((_, el) => $(el).text().trim()).get();
      
      const episodes = $(".eplister ul li").map((_, el) => {
        const episodeKe = $(el).find(".epl-num").text().trim();
        const title = $(el).find(".epl-title").text().trim();
        const link = $(el).find("a").attr("href");
        return { episodeKe, title, link };
      }).get();

      return { title, thumbnail, synopsis, status, studio, season, type, genres, episodes };
    } catch (error) {
      console.error("Error fetching anime details:", error);
      return null;
    }
  },

  download: async (urlEpisodes) => {
    try {
      const { data } = await axios.get(urlEpisodes);
      const $ = cheerio.load(data);
      const downloadLinks = [];

      $(".mirror option").each((_, element) => {
        const encodedValue = $(element).attr("value");
        if (encodedValue) {
          const buffer = Buffer.from(encodedValue, "base64");
          const decodedLink = buffer.toString("utf-8");

          downloadLinks.push({
            server: $(element).text().trim(),
            link: decodedLink.includes("<iframe") ? cheerio.load(decodedLink)("iframe").attr("src") : decodedLink,
          });
        }
      });

      return downloadLinks;
    } catch (error) {
      console.error("Error fetching download links:", error);
      return [];
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: false, creator: CREATOR, error: "Method Not Allowed" });
  }

  const { query, url } = req.query;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const { pathname } = new URL(req.url, `${protocol}://${req.headers.host}`);

  try {
    let data;

    if (pathname.includes("/search")) {
      if (!query) return res.status(400).json({ status: false, creator: CREATOR, error: "Query parameter is required" });
      data = await nontonAnime.search(query);
    } else if (pathname.includes("/download")) {
      if (!url) return res.status(400).json({ status: false, creator: CREATOR, error: "URL parameter is required" });
      data = await nontonAnime.download(url);
    } else if (pathname.includes("/latest")) {
      data = await nontonAnime.latest();
    } else if (pathname.includes("/upcoming")) {
      data = await nontonAnime.upcoming();
    } else if (pathname.includes("/details")) {
      if (!url) return res.status(400).json({ status: false, creator: CREATOR, error: "URL parameter is required" });
      data = await nontonAnime.details(url);
    } else {
      return res.status(404).json({ status: false, creator: CREATOR, error: "Endpoint not found" });
    }

    res.status(200).json({ status: true, creator: CREATOR, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, creator: CREATOR, error: "Internal Server Error" });
  }
}
