# 🌌 Mobius WhatsApp Bot

**Mobius** adalah asisten cerdas WhatsApp multifungsi yang dibangun menggunakan Node.js. Dilengkapi dengan arsitektur berbasis plugin yang modular, Mobius menawarkan ratusan fitur mulai dari integrasi AI tingkat lanjut, sistem RPG & ekonomi, modul *trading* yang kompleks, hingga alat manajemen grup yang tangguh.

[Fitur Utama](#-fitur-utama) •
[Persyaratan](#-persyaratan) •
[Instalasi](#-instalasi) •
[Konfigurasi](#%EF%B8%8F-konfigurasi) •
[Struktur Direktori](#-struktur-direktori)

## ✨ Fitur Utama

Mobius memiliki ratusan plugin yang siap digunakan. Berikut adalah kategori fitur unggulannya:

### 🤖 Integrasi AI (Artificial Intelligence)

* **Chatbot Beragam Model:** Claude, ChatGPT, Perplexity, Kimi, Lumo, Zai.

* **Image Generation:** NanoBanana (Teks ke Gambar), FaceSwap, Hapus Background (NoBG).

* **Audio AI:** SunoAI (Pembuat Musik).

### 📈 Sistem Trading & Ekonomi (Lanjutan)

* Modul *Trading Engine* mandiri (`trading-engine.js`).

* Portofolio, Saham, Crypto, Staking, Pajak (Tax), dan Dividen.

* Bank, Sistem CEO, Simulasi Event, dan Leaderboard Ekonomi.

### 📥 Media Downloader

* Unduh media dari berbagai platform: TikTok, Instagram, Facebook, YouTube (Audio/Video), Spotify, Threads, Pinterest, GitClone, dan Scribd.

### 🎮 RPG & Mini Games

* **Roleplay:** Bekerja, Ngojek, Beli Rumah, Taksi, Leveling & XP.

* **Games:** Werewolf, Ular Tangga, TicTacToe, Tebak Kata (Sambung Kata), Bomb, Suit.

* **Fun:** Menfess (Pesan Rahasia), Cek Khodam, Anonymous Chat.

### 🛠️ Tools & Utility

* Konversi Media (WebP ke MP4, Audio Changer).

* Maker: Pembuat Stiker (WM, Exif, Smeme), Brat Canvas, Quotes, Teks (Nulis).

* Alat pencarian Internet: Jadwal Bola, Klasemen, Info Gempa, Cuaca, GitHub Search, Terjemahan, OCR, TTS.

* Pencari Artikel Khusus: Integrasi Arsip & Berita *New York Times (NYT)*.

* Info eFootball: Statistik, Booster, Skill Pemain.

### 🛡️ Manajemen Grup

* Anti-Link, Anti-Spam, Anti-Call, Anti-Tag.

* Sistem Absensi, Voting (Poll), Welcome/Leave otomatis, Kick, Promote, Demote.

* Sistem Giveaway (Roll, Start, Ikut).

## 💻 Persyaratan

Sebelum menginstal Mobius, pastikan sistem Anda telah menginstal perangkat lunak berikut:

* [Node.js](https://nodejs.org/en/) (Versi 18 atau terbaru)

* [Git](https://git-scm.com/)

* [FFmpeg](https://ffmpeg.org/) (Diperlukan untuk manipulasi Audio/Video & Stiker animasi)

* [ImageMagick](https://imagemagick.org/) (Diperlukan untuk manipulasi Gambar/Teks/Canvas)

## 🚀 Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan Mobius di mesin lokal atau server (VPS) Anda:

1. **Kloning Repositori**

   ```bash
   git clone [https://github.com/tulipnex/mobius.git](https://github.com/tulipnex/mobius.git)
   cd mobius

```

2. **Instal Dependensi**
Pastikan Anda berada di dalam folder repositori, lalu jalankan:
```bash
npm install

```


3. **Jalankan Bot**
Anda bisa menjalankan bot dengan salah satu perintah berikut:
```bash
npm start
# atau
node index.js
# atau menggunakan PM2 (untuk server 24/7)
pm2 start index.js --name "mobius"

```


4. **Tautkan ke WhatsApp**
Saat pertama kali dijalankan, bot akan menampilkan **QR Code** atau **Pairing Code** di terminal. Pindai kode tersebut menggunakan perangkat WhatsApp utama Anda (Perangkat Tautkan / Linked Devices).

## ⚙️ Konfigurasi

Anda dapat mengatur profil pemilik (owner), API Keys, dan pengaturan global bot melalui file `config.js`.

Buka `config.js` menggunakan *text editor* favorit Anda dan sesuaikan bagian berikut:

```javascript
// Contoh isi config.js (Sesuaikan dengan data Anda)
global.owner = ['628xxxxxxxxxx'] // Ganti dengan nomor WhatsApp Anda
global.packname = 'Sticker by'
global.author = 'Mobius Bot'
global.prefix = ['.', '/', '!'] // Prefix perintah bot

```

*Catatan: Beberapa fitur API mungkin memerlukan API Key khusus (seperti fitur AI atau Scraper tertentu). Anda perlu memasukkannya di file konfigurasi atau pada masing-masing plugin jika diminta.*

## 📁 Struktur Direktori

Berikut adalah gambaran umum struktur kode pada Mobius:

```text
mobius/
├── index.js             # Titik masuk utama aplikasi (Entry Point)
├── main.js              # Inisialisasi koneksi Baileys & Handler
├── handler.js           # Penanganan pesan masuk & eksekusi plugin
├── config.js            # File konfigurasi utama bot (Owner, Nama, dll)
├── database.json        # Database lokal (LowDB)
├── lib/                 # Modul inti, fungsi pembantu (Scraper, Downloader, Game Engine)
├── plugins/             # Folder berisi semua perintah/fitur bot (Ratusan File)
├── media/               # Penyimpanan sementara untuk aset media (Stiker, Welcome)
└── src/                 # Aset statis seperti Font kustom & gambar Estetik

```

## 🤝 Berkontribusi

Kami sangat menyambut kontribusi dari pengembang lain! Jika Anda ingin menambahkan plugin baru, memperbaiki *bug*, atau meningkatkan kinerja bot:

1. Lakukan *Fork* pada repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b fitur/NamaFitur`).
3. Lakukan *Commit* perubahan Anda (`git commit -m 'Menambahkan fitur XYZ'`).
4. *Push* ke branch Anda (`git push origin fitur/NamaFitur`).
5. Buat *Pull Request* baru.

Pastikan kode yang Anda buat (terutama di dalam folder `/plugins`) mengikuti struktur kode standar yang ada di repositori ini.

## 📜 Lisensi

Proyek ini menggunakan Lisensi yang tertera pada file `LICENSE`. Dengan menggunakan, menyalin, atau memodifikasi kode ini, Anda tunduk pada syarat dan ketentuan dari lisensi tersebut.
