import fetch from 'node-fetch';
import { CREATOR } from '../../../settings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ status: false, creator: CREATOR, error: 'Invalid or missing "text" in request body' });
  }

  try {
    const imageBuffer = await CarbonifyV1(text);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="carbon.png"');
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('[Carbonify Error]', error);
    res.status(500).json({ status: false, creator: CREATOR, error: error.message || 'Internal Server Error' });
  }
}

async function CarbonifyV1(input) {
  const response = await fetch('https://carbonara.solopov.dev/api/cook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: input }),
  });

  if (!response.ok) {
    throw new Error(`Carbon API responded with ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
