import mal from 'mal-scraper';
import { config, updateStatistics } from '../../../config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Metode tidak diizinkan. Silakan gunakan GET.' });
  }

  try {
    const { query, apikey } = req.query;
    if (!apikey) return res.status(401).json({ success: false, message: 'Kunci API dibutuhkan' });
    const user = config.apiKeys[apikey];
    if (!user) return res.status(401).json({ success: false, message: 'Kunci API tidak valid' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Kunci API telah dinonaktifkan' });

    if (!query) return res.status(400).json({ success: false, message: 'Parameter "query" dibutuhkan.' });

    const result = await mal.getInfoFromName(query);
    updateStatistics('anime-search', apikey);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    const isNotFound = /not found/i.test(error.message);
    res.status(isNotFound ? 404 : 500).json({
      success: false,
      message: isNotFound ? `Anime dengan judul "${req.query.query}" tidak ditemukan.` : 'Terjadi kesalahan internal pada server.'
    });
  }
}
