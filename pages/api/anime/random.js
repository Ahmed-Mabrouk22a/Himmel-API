import axios from 'axios';
import { config, updateStatistics } from '../../../config.js';

const SFW_CATEGORIES = [
  'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 
  'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 
  'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 
  'happy', 'wink', 'poke', 'dance', 'cringe'
];
const NSFW_CATEGORIES = ['waifu', 'neko', 'trap'];

async function getRandomWaifuImage(type, category) {
  try {
    const jsonResponse = await axios.get(`https://api.waifu.pics/${type}/${category}`);
    const imageUrl = jsonResponse.data.url;

    if (!imageUrl) {
      throw new Error('URL gambar tidak ditemukan dari respons API sumber.');
    }

    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    return {
      buffer: imageResponse.data,
      contentType: imageResponse.headers['content-type'],
      sourceUrl: imageUrl
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Kategori "${category}" tidak valid untuk tipe "${type}".`);
    }
    throw new Error('Gagal mengambil data dari API Waifu.pics.');
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Source-Url');
  res.setHeader('Access-Control-Expose-Headers', 'X-Source-Url');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Metode tidak diizinkan. Silakan gunakan GET.' });
  }

  try {
    const { type, category, apikey } = req.query;

    if (!apikey) return res.status(401).json({ success: false, message: 'Kunci API dibutuhkan' });
    const user = config.apiKeys[apikey];
    if (!user) return res.status(401).json({ success: false, message: 'Kunci API tidak valid' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Kunci API telah dinonaktifkan' });

    if (!type || !category) {
      return res.status(400).json({ success: false, message: 'Parameter "type" dan "category" dibutuhkan.' });
    }

    const lowerType = type.toLowerCase();
    const lowerCategory = category.toLowerCase();

    if (lowerType !== 'sfw' && lowerType !== 'nsfw') {
      return res.status(400).json({ success: false, message: 'Parameter "type" harus "sfw" atau "nsfw".' });
    }

    const validCategories = lowerType === 'sfw' ? SFW_CATEGORIES : NSFW_CATEGORIES;
    if (!validCategories.includes(lowerCategory)) {
      return res.status(400).json({ 
        success: false, 
        message: `Kategori "${category}" tidak valid untuk tipe "${type}".`,
        available_categories: validCategories
      });
    }

    const result = await getRandomWaifuImage(lowerType, lowerCategory);
    updateStatistics('random-waifu', apikey);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('X-Source-Url', result.sourceUrl);
    return res.status(200).send(result.buffer);

  } catch (error) {
    const statusCode = error.message.includes("valid") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}
