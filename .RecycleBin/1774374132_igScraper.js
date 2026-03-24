const axios = require('axios');

/**
 * Scraper untuk Media Instagram (Foto, Video, Reels)
 * Menggunakan API yang lebih stabil untuk menghindari kendala koneksi.
 */
async function igDownload(url) {
    try {
        // Membersihkan URL agar tidak ada parameter sampah
        const cleanUrl = url.split('?')[0];
        
        // Menggunakan endpoint API yang umum digunakan pada bot Baileys
        // Jika Anda memiliki apikey global.btc, pastikan sudah terisi di config
        const apikey = global.btc || 'api-key-anda'; // Ganti dengan apikey anda jika diperlukan
        const response = await axios.get(`https://api.botcahx.eu.org/api/dowloader/igdl?url=${encodeURIComponent(cleanUrl)}&apikey=${apikey}`);
        
        const res = response.data;

        if (res.status && res.result) {
            // Mapping hasil agar konsisten dengan plugin ig.js
            return res.result.map(v => ({
                type: (v.url.includes('.mp4') || v.url.includes('video')) ? 'video' : 'image',
                url: v.url,
                thumbnail: v.thumbnail || ''
            }));
        } else {
            throw new Error(res.message || "Media tidak ditemukan.");
        }
    } catch (e) {
        console.error("Scraper Error:", e.message);
        // Fallback jika API utama gagal, kita lempar pesan yang lebih spesifik
        throw new Error("Gagal mengambil data. Pastikan link benar, akun tidak privat, dan server sedang tidak maintenance.");
    }
}

/**
 * Scraper untuk Info Profil Instagram
 */
async function igProfile(username) {
    try {
        const user = username.replace('@', '');
        const apikey = global.btc || 'api-key-anda';
        const response = await axios.get(`https://api.botcahx.eu.org/api/webzone/igprofile?user=${user}&apikey=${apikey}`);
        
        const res = response.data;

        if (res.status && res.result) {
            return {
                name: res.result.full_name,
                username: res.result.username,
                bio: res.result.biography,
                followers: res.result.followers,
                following: res.result.following,
                posts: res.result.posts_count,
                pp: res.result.profile_pic_url_hd,
                is_private: res.result.is_private,
                is_verified: res.result.is_verified
            };
        } else {
            throw new Error("Profil tidak ditemukan.");
        }
    } catch (e) {
        console.error("Profile Error:", e.message);
        throw new Error(`Gagal mendapatkan profil @${username}.`);
    }
}

module.exports = { igDownload, igProfile };