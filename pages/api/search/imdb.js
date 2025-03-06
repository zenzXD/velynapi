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

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            status: false,
            creator: CREATOR,
            error: "Query parameter is required",
        });
    }

    try {
        const data = await searchIMDB(query);
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

async function searchIMDB(title) {
    const url = `http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(title)}&plot=full`;

    try {
        const { data } = await axios.get(url);

        if (data.Response !== "True") {
            return { error: "Movie not found" };
        }

        return {
            title: data.Title,
            year: data.Year,
            rated: data.Rated,
            released: data.Released,
            runtime: data.Runtime,
            genre: data.Genre,
            director: data.Director,
            writer: data.Writer,
            actors: data.Actors,
            plot: data.Plot,
            language: data.Language,
            country: data.Country,
            awards: data.Awards,
            poster: data.Poster,
            ratings: data.Ratings.map(rating => ({
                source: rating.Source,
                value: rating.Value
            })),
            imdbRating: data.imdbRating,
            imdbVotes: data.imdbVotes,
            imdbID: data.imdbID,
            type: data.Type,
            boxOffice: data.BoxOffice,
            production: data.Production,
            website: data.Website
        };
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        throw new Error("Failed to fetch IMDB data");
    }
}
