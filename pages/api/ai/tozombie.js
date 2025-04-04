import axios from "axios";
import FormData from "form-data";
import { API_KEY, CREATOR } from "../../../settings";
const MAX_TRIES = 20; 
const TIMEOUT_MS = 3000;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      creator: CREATOR,
      error: "Method Not Allowed",
    });
  }

  const { url, apikey } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      error: "Bad Request: Parameter 'url' tidak boleh kosong",
    });
  }

  if (!apikey || apikey !== "Velyn") { 
    return res.status(401).json({
      status: false,
      creator: CREATOR,
      error: "Unauthorized: API Key tidak valid",
    });
  }

  try {
    const imageBuffer = await toZombie(url);

    if (!imageBuffer || !(imageBuffer instanceof Buffer)) {
      return res.status(500).json({
        status: false,
        creator: CREATOR,
        error: "Internal Server Error: Invalid image buffer response",
      });
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", imageBuffer.length);
    res.status(200).send(imageBuffer);

  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({
      status: false,
      creator: CREATOR,
      error: error.message || "Internal Server Error",
    });
  }
}

async function toZombie(imageUrl) {
  let { data } = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: TIMEOUT_MS });

  let formData = new FormData();
  formData.append("photofile", data, { filename: "input.jpg" });
  formData.append("action", "upload");

  let { data: uploadResponse } = await axios.post("https://makemezombie.com/response.php", formData, {
    headers: { ...formData.getHeaders() },
    timeout: TIMEOUT_MS,
  });

  let key = uploadResponse.key;
  console.log(`Key dari Image: ${key}`);

  let tries = 0;
  while (tries < MAX_TRIES) {
    let checkData = new FormData();
    checkData.append("action", "check");
    checkData.append("image_id", key);

    let { data: response } = await axios.post("https://makemezombie.com/response.php", checkData, { timeout: TIMEOUT_MS });

    if (response.ready == "1") {
      return axios.get(response.image_url, { responseType: "arraybuffer", timeout: TIMEOUT_MS })
        .then((imgRes) => Buffer.from(imgRes.data));
    }

    tries++;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Tunggu 1 detik sebelum mencoba lagi
  }

  throw new Error("Processing time exceeded limit.");
}
