import fs from 'fs';
import path from 'path';
import axios from 'axios';

const GITHUB_API = 'https://api.github.com/repos/NyxObscura/velyn/contents/velyn.json?ref=main';
const TOKEN = "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";
const OWNER_KEY = "Xavelyn";

let apiKeys = [];

try {
    const apiKeyData = fs.readFileSync(path.join(process.cwd(), "velyn.json"), "utf8");
    const parsedData = JSON.parse(apiKeyData);
    apiKeys = parsedData.api_keys && Array.isArray(parsedData.api_keys) ? parsedData.api_keys : [];

    console.log("API keys berhasil dimuat:", apiKeys);
} catch (error) {
    console.error("Gagal membaca file velyn.json:", error);
    process.exit(1);
}

async function saveApiKeys() {
    try {
        const updatedData = JSON.stringify({ api_keys: apiKeys }, null, 2);
        const fileContent = Buffer.from(updatedData).toString('base64');

        console.log('Menyimpan API keys ke GitHub...');
        const { data } = await axios.get(GITHUB_API, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: 'application/vnd.github+json'
            }
        });

        if (!data.sha) {
            throw new Error('SHA file tidak ditemukan di respon GitHub.');
        }
        
        await axios.put(
            GITHUB_API,
            {
                message: 'Update API keys',
                content: fileContent,
                sha: data.sha
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        console.log('API keys berhasil disimpan ke GitHub.');
    } catch (error) {
        console.error('Gagal menyimpan API keys ke GitHub:', error.message);
    }
}

async function removeExpiredApiKeys() {
    const now = Date.now();
    const expiredKeys = apiKeys.filter(apiKey => apiKey.expiresAt !== null && now > apiKey.expiresAt);

    if (expiredKeys.length) {
        console.log('Menghapus API keys yang sudah kedaluwarsa:', expiredKeys);
        apiKeys = apiKeys.filter(apiKey => apiKey.expiresAt === null || now <= apiKey.expiresAt);
        await saveApiKeys();
    } else {
        console.log('Tidak ada API keys yang kedaluwarsa.');
    }
}

const validateApiKey = (req, res, next) => {
    const requestApiKey = req.query.apikey;

    if (!requestApiKey) {
        return res.status(401).json({ error: "API key tidak ditemukan dalam request." });
    }

    const apiKeyEntry = apiKeys.find((key) => key.key === requestApiKey);

    if (!apiKeyEntry) {
        return res.status(403).json({ error: "API key tidak valid." });
    }

    if (apiKeyEntry.expiresAt !== null && Date.now() > apiKeyEntry.expiresAt) {
        return res.status(403).json({ error: "API key telah kedaluwarsa." });
    }

    console.log("API key valid, melanjutkan ke handler berikutnya.");
    next();
};

const validateOwner = (req, res, next) => {
    const requestApiKeyOwn = req.query.apikeyown;

    if (!requestApiKeyOwn || requestApiKeyOwn !== OWNER_KEY) {
        return res.status(403).json({
            success: false,
            error: 'Akses ditolak. Anda bukan pemilik yang sah.'
        });
    }
    next();
};

export { validateApiKey, validateOwner };
