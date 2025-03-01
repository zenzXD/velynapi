import { CREATOR } from "../../../settings";
import axios from 'axios';

const API_KEY = ['Xavelyn'];
const GITHUB_TOKEN = "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"; 
const GITHUB_API_URL = "https://api.github.com/repos/NyxObscura/velyn/contents/velyn.json?ref=main"; 

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: false,
      creator: CREATOR,
      error: 'Method Not Allowed',
    });
  }

  const { newApiKey, expiresInDays } = req.query;
  const apikeyown = req.query.apikeyown;

  if (!apikeyown || !API_KEY.includes(apikeyown)) {
    return res.status(403).json({
      status: false,
      creator: CREATOR,
      error: 'API Key tidak valid atau tidak disertakan.',
    });
  }

  if (!newApiKey) {
    return res.status(400).json({
      status: false,
      creator: CREATOR,
      error: 'API key baru tidak ditemukan dalam permintaan.',
    });
  }

  try {
    // Fetch the content of the apikey.json file from GitHub using the GITHUB_API_URL
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const fileContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const parsedContent = JSON.parse(fileContent);
    const existingKeys = parsedContent.api_keys || [];

    // Check if the new API key already exists
    if (existingKeys.some((key) => key.key === newApiKey)) {
      return res.status(400).json({
        status: false,
        creator: CREATOR,
        error: 'API key sudah ada.',
      });
    }

    const now = Date.now();
    let expiresAt = null;

    if (expiresInDays && expiresInDays !== 'unlimited') {
      const days = parseInt(expiresInDays);
      if (isNaN(days) || days <= 0) {
        return res.status(400).json({
          status: false,
          creator: CREATOR,
          error: 'expiresInDays harus berupa angka positif atau "unlimited".',
        });
      }
      expiresAt = now + days * 24 * 60 * 60 * 1000;
    }

    // Add the new API key to the list
    existingKeys.push({
      key: newApiKey,
      createdAt: now,
      expiresAt: expiresAt,
    });

    const updatedContent = Buffer.from(
      JSON.stringify({ api_keys: existingKeys }, null, 4)
    ).toString('base64');

    // Update the apikey.json file in the GitHub repo
    await axios.put(
      GITHUB_API_URL,
      {
        message: 'Update API keys',
        content: updatedContent,
        sha: response.data.sha,
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let timeLeftFormatted = 'Unlimited';
    if (expiresAt) {
      const timeLeftInMs = expiresAt - now;
      const days = Math.floor(timeLeftInMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor((timeLeftInMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeftInMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((timeLeftInMs % (60 * 1000)) / 1000);

      timeLeftFormatted = `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`;
    }

    res.status(200).json({
      status: true,
      creator: CREATOR,
      message: 'API key berhasil ditambahkan.',
      apiKey: newApiKey,
      createdAt: new Date(now).toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'Unlimited',
      timeLeft: timeLeftFormatted,
      expiresInDays: expiresInDays === 'unlimited' ? 'Unlimited' : parseInt(expiresInDays),
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      status: false,
      creator: CREATOR,
      error: 'Terjadi kesalahan saat menyimpan API key ke GitHub.',
    });
  }
}
