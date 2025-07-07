import { config } from '../../config.js';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  const { apikey } = req.query;
  
  if (!apikey) {
    return res.status(401).json({ 
      success: false, 
      message: 'API key required' 
    });
  }
  
  if (!config.apiKeys[apikey]) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid API key' 
    });
  }
  
  const userKey = config.apiKeys[apikey];
  
  // Return different stats based on user role
  let stats = {
    success: true,
    data: {
      totalRequests: config.statistics.totalRequests,
      totalUsers: config.statistics.totalUsers,
      totalEndpoints: config.statistics.totalEndpoints,
      userStats: {
        requestCount: userKey.requestCount,
        lastUsed: userKey.lastUsed,
        monthlyLimit: userKey.monthlyLimit || 'Unlimited'
      }
    }
  };
  
  // Admin users get additional stats
  if (userKey.type === 'admin') {
    stats.data.adminStats = {
      dailyRequests: config.statistics.dailyRequests,
      popularEndpoints: config.statistics.popularEndpoints,
      visitors: config.statistics.visitors,
      allUsers: Object.keys(config.apiKeys).length
    };
  }
  
  res.status(200).json(stats);
}