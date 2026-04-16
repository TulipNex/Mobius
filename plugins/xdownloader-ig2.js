const { scrapeInstagram } = require('../lib/snapinsta');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validasi input user
    if (!text) {
        return m.reply(`Masukkan URL Instagram!\n\nContoh: *${usedPrefix + command} https://www.instagram.com/reel/DUt4CbgkilZ/*`);
    }

    // Cek apakah URL valid dari Instagram
    if (!text.match(/(https:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/.*)/i)) {
        return m.reply('URL yang Anda masukkan bukan URL Instagram yang valid!');
    }

    // Kirim pesan loading dari config global
    m.reply(global.wait);

    try {
        // Eksekusi proses scraping
        const result = await scrapeInstagram(text);

        // Validasi ketersediaan media
        if (result.videos.length === 0 && result.images.length === 0) {
            return m.reply('Gagal menemukan media. Pastikan URL valid dan akun Instagram tersebut tidak di-private.');
        }

        let captionText = `✅ *Berhasil mengunduh media dari Instagram*\n\n${global.wm || '© Bot WhatsApp'}`;

        // ==========================================
        // LOGIKA FILTER SMART CAROUSEL / THUMBNAIL
        // ==========================================
        let isReelOrTV = text.match(/\/(reel|tv)\//i);
        
        // Cek jika ini murni video post (1 video + 1 thumbnail bawaannya) 
        // atau carousel yang HANYA berisi video (jumlah video = jumlah thumbnail)
        let isOnlyVideos = (result.videos.length > 0 && result.videos.length === result.images.length);

        // Jika berbentuk carousel/slide campuran, logikanya akan tembus dan mengeksekusi pengiriman gambar
        if (!(isReelOrTV || isOnlyVideos)) {
            // Kirim semua gambar terlebih dahulu
            for (let imageUrl of result.images) {
                await conn.sendFile(m.chat, imageUrl, 'ig_image.jpg', captionText, m);
            }
        }

        // Kemudian kirim semua video (baik tunggal maupun dari slide)
        for (let videoUrl of result.videos) {
            await conn.sendFile(m.chat, videoUrl, 'ig_video.mp4', captionText, m);
        }

    } catch (e) {
        console.error('Error IG Downloader:', e);
        // Fallback error menggunakan global.eror
        m.reply(`${global.eror}\n\nTerjadi kesalahan sistem saat mencoba memproses link. Detail:\n_${e.message}_`);
    }
}

handler.help = ['snap'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(snap)$/i

// Flag keamanan dan fungsional
handler.limit = true; // Mengurangi limit user
handler.group = false; 

module.exports = handler;