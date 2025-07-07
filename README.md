# 🌐 Himmél API Hub (Self-Contained)

Selamat datang di **Himmél API Hub**, sebuah platform API terpusat yang **ringan**, **modern**, dan **sepenuhnya mandiri**. Dibangun menggunakan **Next.js**, proyek ini dirancang untuk berjalan tanpa perlu database eksternal — semua konfigurasi disimpan secara lokal. 💡

> Cocok untuk proyek pribadi, portofolio, atau sebagai fondasi membangun server API skala besar.

---

## ✨ Fitur Utama

- 🖥️ **Dasbor UI Modern**  
  Antarmuka yang bersih dan responsif menggunakan **React + Tailwind CSS** untuk menampilkan semua endpoint yang tersedia.

- 🔐 **Validasi API Key Lokal**  
  Sistem otentikasi berbasis file konfigurasi lokal (`config.js`), tanpa backend atau database tambahan.

- 🧩 **Struktur Modular**  
  Tambah endpoint baru hanya dengan menambahkan file di `pages/api/`. Sangat mudah dikembangkan dan disesuaikan.

- ⚡ **Performa Cepat & Ringan**  
  Tanpa ketergantungan database eksternal — langsung jalan dan hemat sumber daya!

---

## 🛠️ Teknologi yang Digunakan

### 🧑‍💻 Frontend
- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)

### ⚙️ Backend & Konfigurasi
- **Runtime**: Node.js (via Next.js API Routes)
- **Konfigurasi**: Data statis via `config.js`
- **Library Pendukung**:
  - `axios` – untuk permintaan HTTP ke API eksternal
  - Library lain sesuai kebutuhan, misalnya: `yt-search`, `qrcode`, dll.

---

## 🗂️ Struktur Proyek

```

📁 Himmel-API
├── 📁 pages
│   ├── 📄 page.jsx             → UI utama dasbor
│   └── 📁 api/                 → Semua file endpoint API
├── 📁 src/lib
│   └── 📄 api-helpers.js      → Fungsi validasi API Key
├── 📄 config.js               → Konfigurasi API key dan daftar endpoint
├── 📄 globals.css             → Styling global dan tema

````

---

## 🚀 Cara Instalasi & Menjalankan

### 1️⃣ Clone repositori

```bash
git clone https://github.com/himmel-ext/Himmel-API.git
cd Himmel-API
````

### 2️⃣ Instal dependensi

```bash
npm install
```

### 3️⃣ Konfigurasi API Key & Endpoint

Edit file `config.js`:

```js
// config.js
export const apiKeys = {
  'API_KEY_RAHASIA_123': { name: 'User Utama', type: 'owner' },
  'API_KEY_TAMU_456': { name: 'Tamu', type: 'user' },
};

export const endpoints = [
  {
    id: 'ytsearch',
    name: 'Youtube',
    description: 'Mencari video di YouTube.',
    category: 'Search'
  },
  {
    id: 'qrcode',
    name: 'QR Code Generator',
    description: 'Membuat gambar QR Code.',
    category: 'Generator'
  }
];
```

### ⚠️ **Aturan Penambahan Endpoint**

> **Nama file endpoint (di `pages/api/`) dan `id` di `config.js` harus ***sama persis***.**

Jika tidak, akan muncul error:

```
JSON Error: Endpoint tidak ditemukan atau salah konfigurasi.
```

Contoh:

* File: `pages/api/qrcode.js`
* ID: `qrcode` ✅ cocok

---

### 4️⃣ Jalankan server development

```bash
npm run dev
```

🔗 Buka [http://localhost:3000](http://localhost:3000) di browser kamu.

---

## 🤝 Kontribusi

Kontribusi terbuka untuk siapa saja!
Silakan fork, buat branch baru, dan kirim pull request. Jangan lupa untuk membaca dokumentasi konfigurasi sebelum menambah endpoint.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT**.

---

Dengan cinta,
**Himmél API Hub** ✨💙
