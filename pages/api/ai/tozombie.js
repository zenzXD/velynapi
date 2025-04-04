import axios from "axios";
import FormData from "form-data";
import { API_KEY, CREATOR } from "../../../settings";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      creator: CREATOR,
      error: "Method Not Allowed",
    });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      error: "Bad Request: Missing 'url' parameter",
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
    console.error("Zombie API Error:", error.message || error);
    res.status(500).json({
      status: false,
      creator: CREATOR,
      error: "Internal Server Error",
    });
  }
}

async function toZombie(imageUrl) {
  const { data: imageData } = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const formData = new FormData();
  formData.append("photofile", imageData, { filename: "image.jpg" });
  formData.append("action", "upload");

  const uploadResponse = await axios.post(
    "https://makemezombie.com/response.php",
    formData,
    { headers: formData.getHeaders() }
  );

  const key = uploadResponse.data?.key;
  if (!key) throw new Error("Failed to get key from makemezombie");

  let resultUrl;
  for (let i = 0; i < 20; i++) {
    const checkData = new FormData();
    checkData.append("action", "check");
    checkData.append("image_id", key);

    const checkResponse = await axios.post(
      "https://makemezombie.com/response.php",
      checkData
    );

    if (checkResponse.data?.ready === "1") {
      resultUrl = `https://makemezombie.com/${checkResponse.data.image}`;
      break;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!resultUrl) throw new Error("Zombie image not ready after timeout");

  const finalImage = await axios.get(resultUrl, {
    responseType: "arraybuffer",
  });

  return Buffer.from(finalImage.data);
}
