const { ttStalk } = require('../lib/scraper-tiktokstalk');

// Helper fungsi untuk memformat angka metrik (contoh: 1500 -> 1.5K, 1500000 -> 1.5M)
const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// Helper fungsi untuk memformat durasi detik ke MM:SS (contoh: 93 -> 01:33)
const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input User
    if (!text) {
        return m.reply(`Masukkan username TikTok yang ingin di-stalk!\n\nContoh: *${usedPrefix + command} zeeasadel*`);
    }

    // 2. Simulasi Loading Pesan
    m.reply(global.wait);

    try {
        // 3. Eksekusi Scraper
        const data = await ttStalk(text);

        // 4. Formatting output 
        let caption = `
*T I K T O K   S T A L K*

👤 *Username:* @${data.username}
📛 *Nickname:* ${data.nickname}
🔗 *Link Profile:* https://www.tiktok.com/@${data.username}

🎬 *${data.latest_videos.length} Video Terakhir:*`;

        // 5. Looping untuk menambahkan data video terbaru ke dalam caption secara rapi
        data.latest_videos.forEach((v, i) => {
            // Memotong title agar tidak terlalu panjang dan merusak format chat (Maks 45 Karakter)
            let shortTitle = v.title.length > 45 ? v.title.substring(0, 45) + '...' : (v.title || 'Tanpa Judul');
            
            caption += `\n\n*${i + 1}. ${shortTitle}*
⏱️ *Durasi:* ${formatTime(v.duration || 0)}
📊 *Statistik:* ${formatNumber(v.play_count || 0)} Views | ${formatNumber(v.like_count || 0)} Likes
💬 *Komentar:* ${formatNumber(v.comment_count || 0)} | 🔄 *Share:* ${formatNumber(v.share_count || 0)}
🔗 ${v.url}`;
        });

        caption += `\n\n${global.wm}`;

        // 6. Mengirim Hasil (Foto Avatar + Caption)
        // Fallback jika tidak ada avatar URL disediakan foto default
        let ppUrl = data.avatar || 'https://telegra.ph/file/1ec1148f3289052d9a60e.png';

        await conn.sendFile(m.chat, ppUrl, 'ttstalk.jpg', caption.trim(), m);

    } catch (e) {
        console.error('[TT Stalk Plugin Error]', e);
        m.reply(`*Gagal mengambil profil!*\nPastikan username valid dan akun tidak dalam status *Private*.\n\nDetail: ${e.message}`);
    }
}

handler.help = ['ttstalk <username>']
handler.tags = ['internet']
handler.command = /^(ttstalk|tiktokstalk|stalktt)$/i

// Flag Keamanan & Ekonomi
handler.limit = true // Mengurangi batas / saldo user setiap kali stalk sukses

module.exports = handler;