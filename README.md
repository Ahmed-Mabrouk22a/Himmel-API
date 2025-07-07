# Himmél API Hub (Self-Contained)
Source code untuk Himmél API Hub, sebuah platform API terpusat yang ringan, modern, dan sepenuhnya mandiri (self-contained). Proyek ini dibangun dengan Next.js dan dirancang untuk berjalan tanpa memerlukan database eksternal.
Seluruh konfigurasi, termasuk kunci API dan daftar endpoint, dikelola secara lokal dalam file config.js, membuatnya sangat mudah untuk di-deploy dan cocok untuk proyek pribadi, portofolio, atau sebagai dasar untuk membangun API server yang lebih kompleks.
Fitur Utama
 * Dasbor UI Modern: Antarmuka pengguna (UI) yang bersih dan responsif dibangun dengan React dan Tailwind CSS untuk menampilkan semua endpoint yang tersedia.
 * Validasi API Key Lokal: Sistem otentikasi sederhana yang memvalidasi kunci API langsung dari file konfigurasi lokal pada setiap permintaan.
 * Struktur Modular: Desain kode yang rapi memungkinkan Anda untuk dengan mudah menambah atau memodifikasi endpoint baru langsung di dalam direktori pages/api/.
 * Ringan & Cepat: Tanpa ketergantungan pada database eksternal, platform ini menawarkan performa yang sangat cepat dan jejak sumber daya yang minimal.
Teknologi yang Digunakan
Frontend
 * Framework: Next.js (React)
 * Styling: Tailwind CSS
 * Animasi: Framer Motion
Backend & Konfigurasi
 * Runtime: Node.js (via Next.js API Routes)
 * Konfigurasi: Data hardcode dalam file config.js untuk manajemen API Key dan endpoint.
 * Library Pendukung:
   * axios: Untuk permintaan HTTP ke API eksternal.
   * Library lain sesuai kebutuhan endpoint (contoh: yt-search, qrcode).
Struktur Proyek
 * pages/page.jsx: File utama yang berisi logika antarmuka dasbor.
 * pages/api/: Direktori yang berisi semua file endpoint API.
 * src/lib/api-helpers.js: Modul untuk validasi API Key berdasarkan data dari config.js.
 * config.js: File pusat konfigurasi. Di sinilah Anda mendefinisikan API key yang valid dan detail endpoint yang ditampilkan di dasbor.
 * globals.css: File styling global untuk tema dan komponen kustom.
Instalasi & Konfigurasi
Untuk menjalankan proyek ini secara lokal:
 * Clone repositori ini:
   git clone https://github.com/himmel-ext/Himmel-API.git
cd Himmel-API

 * Instal semua dependensi:
   npm install

 * Konfigurasi Kunci API & Endpoint:
   * Buka file config.js.
   * Ubah atau tambahkan API key dan daftar endpoint sesuai kebutuhan Anda. Contoh struktur:
     // config.js
export const apiKeys = {
  'API_KEY_RAHASIA_123': { name: 'User Utama', type: 'owner' },
  'API_KEY_TAMU_456': { name: 'Tamu', type: 'user' },
};

export const endpoints = [
  { id: 'ytsearch', name: 'Youtube', description: 'Mencari video di YouTube.', category: 'Search' },
  { id: 'qrcode', name: 'QR Code Generator', description: 'Membuat gambar QR Code.', category: 'Generator' },
];

 * Jalankan server pengembangan:
   npm run dev

   Buka http://localhost:3000 di browser Anda.
