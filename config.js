const API_BASE_URL = 'https://cdn.himmel.web.id'; 

export const config = {
  apiKeys: {
    'himmel-owner': {
      type: 'owner',
      userId: 'owner_001',
      name: 'Owner',
      permissions: ['*'],
      createdAt: '2024-01-01',
      lastUsed: new Date().toISOString(),
      requestCount: 0,
      isActive: true
    },
    'hmml': {
      type: 'admin',
      userId: 'admin_001',
      name: 'Himmel',
      permissions: ['read', 'write', 'delete', 'admin'],
      createdAt: '2024-01-01',
      lastUsed: new Date().toISOString(),
      requestCount: 0,
      isActive: true
    },
    'premium_key_67890': {
      type: 'premium',
      userId: 'premium_001',
      name: 'Himmel',
      permissions: ['read', 'write'],
      createdAt: '2024-01-15',
      lastUsed: new Date().toISOString(),
      requestCount: 0,
      isActive: true,
      monthlyLimit: 10000
    },
    'himmel': {
      type: 'user',
      userId: 'user_001',
      name: 'Anonim',
      permissions: ['read'],
      createdAt: '2024-02-01',
      lastUsed: new Date().toISOString(),
      requestCount: 0,
      isActive: true,
      monthlyLimit: 1
    }
  },

  endpoints: [
    {
      id: 'pinterest-search',
      name: 'Pinterest Image Search',
      path: '/api/pinterest/search',
      method: 'GET',
      description: 'Search images on Pinterest by keyword',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'Search query for images' },
        { name: 'apikey', type: 'string', required: true, description: 'Your API key' }
      ],
      responseType: 'application/json',
      accessLevel: 'user',
      category: 'Search',
      mt: false,
      documentation: 'Endpoint ini memungkinkan pencarian gambar di Pinterest. Hasilnya adalah daftar URL gambar yang relevan dengan kata kunci pencarian Anda.',
      usage: {
        curl: `curl -X GET "${API_BASE_URL}/api/pinterest/search?query=nature&apikey=YOUR_API_KEY"`,
        javascript: `fetch('${API_BASE_URL}/api/pinterest/search?query=nature&apikey=YOUR_API_KEY')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`
      },
      notes: 'Jumlah hasil yang dikembalikan dapat bervariasi tergantung pada ketersediaan gambar untuk kata kunci yang diberikan.'
    },
    {
      id: 'random-waifu',
      name: 'Random Anime Pic',
      path: '/api/anime/random',
      method: 'GET',
      description: 'Mendapatkan gambar anime acak.',
      parameters: [
        { name: 'type', type: 'string', required: true, in: 'query', description: 'Tipe gambar (sfw atau nsfw)' },
        { name: 'category', type: 'string', required: true, in: 'query', description: 'Kategori SFW/NSFW' },
        { name: 'apikey', type: 'string', required: true, in: 'query', description: 'Kunci API Anda' }
      ],
      responseType: 'image/*',
      accessLevel: 'user',
      category: 'Anime',
      mt: false,
      documentation: 'Menghasilkan gambar anime acak dari berbagai kategori. Anda harus menentukan tipe (`sfw` atau `nsfw`) dan kategori yang diinginkan. Contoh kategori SFW: `waifu`, `neko`. Contoh kategori NSFW: `waifu`, `trap`. Responsnya adalah file gambar langsung (buffer).',
      usage: {
        curl: `curl -X GET "${API_BASE_URL}/api/anime/random?type=sfw&category=waifu&apikey=YOUR_API_KEY" --output image.png`,
        javascript: `fetch('${API_BASE_URL}/api/anime/random?type=sfw&category=waifu&apikey=YOUR_API_KEY')\n  .then(response => response.blob())\n  .then(blob => {\n    const url = URL.createObjectURL(blob);\n    // Gunakan 'url' untuk menampilkan gambar\n  })\n  .catch(error => console.error('Error:', error));`
      },
      notes: 'Pastikan untuk memeriksa daftar kategori yang tersedia untuk setiap tipe (SFW/NSFW) untuk menghindari error.'
    }
  ],

  statistics: {
    totalRequests: 374,
    totalUsers: 16,
    totalEndpoints: 2,
    dailyRequests: {},
    popularEndpoints: {},
    visitors: {
      total: 0,
      today: 0,
      thisMonth: 0
    }
  },

  site: {
    name: 'Himmél API',
    description: 'Selamat datang di web Himmél API!',
    version: '1.0.0',
    author: 'Himmél'
  }
};

export function updateStatistics(endpointId, apiKey) {
  const today = new Date().toISOString().split('T')[0];
  
  config.statistics.totalRequests++;
  
  if (!config.statistics.dailyRequests[today]) {
    config.statistics.dailyRequests[today] = 0;
  }
  config.statistics.dailyRequests[today]++;
  
  if (!config.statistics.popularEndpoints[endpointId]) {
    config.statistics.popularEndpoints[endpointId] = 0;
  }
  config.statistics.popularEndpoints[endpointId]++;
  
  if (config.apiKeys[apiKey]) {
    config.apiKeys[apiKey].requestCount++;
    config.apiKeys[apiKey].lastUsed = new Date().toISOString();
  }
}

export function updateVisitors() {
  const today = new Date().toISOString().split('T')[0];
  config.statistics.visitors.total++;
  config.statistics.visitors.today++;
  config.statistics.visitors.thisMonth++;
}
