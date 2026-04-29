const axios = require('axios');
const crypto = require('crypto');

// Fungsi untuk generate deviceId acak yang terlihat valid
function generateDeviceId() {
    return crypto.createHash('md5')
        .update(crypto.randomUUID() + Date.now().toString())
        .digest('hex')
        .slice(0, 42);
}

// Kumpulan User-Agent untuk Spoofing (Bypass deteksi bot)
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(
            `❌ *Format salah!*\n\n` +
            `Gunakan: ${usedPrefix + command} <username>|<pesan>|<jumlah>\n` +
            `Contoh: ${usedPrefix + command} mitrawann|halo bang|50\n\n` +
            `*Catatan:* Jumlah maksimal adalah 300 untuk keamanan server.`
        );
    }

    // Parsing input: username|pesan|jumlah (jumlah opsional)
    let parts = text.split('|').map(p => p.trim());
    let username, pesan, jumlah;

    if (parts.length >= 3) {
        username = parts[0];
        pesan = parts.slice(1, -1).join('|'); // gabung jika pesan mengandung '|'
        jumlah = parseInt(parts[parts.length - 1]);
    } else if (parts.length === 2) {
        username = parts[0];
        pesan = parts[1];
        jumlah = 25; // default 25
    } else {
        return m.reply('❌ Minimal masukkan target username dan pesan!');
    }

    if (!username || !pesan) return m.reply('❌ Username dan pesan tidak boleh kosong!');
    if (isNaN(jumlah) || jumlah < 1) jumlah = 25;
    
    // Safety limit untuk mencegah bot crash / koneksi terputus
    if (jumlah > 300) {
        return m.reply('❌ Maksimal 300 spam untuk menjaga keamanan IP Bot dari pemblokiran Cloudflare.');
    }

    let successCount = 0;
    let rateLimitedCount = 0;
    let failedCount = 0;

    await m.reply(`⏳ Memulai Eksekusi Spam NGL...\n\n👤 *Target:* ${username}\n💬 *Pesan:* ${pesan}\n🔢 *Jumlah:* ${jumlah}\n\n_Bot akan memproses ini di latar belakang, mohon tunggu..._`);

    const timeout = 15000; // 15 detik timeout per request

    for (let i = 1; i <= jumlah; i++) {
        const deviceId = generateDeviceId();
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)]; // Rotasi UA
        
        // Header Spoofing untuk Bypass Anti-Bot NGL
        const headers = {
            'User-Agent': randomUA,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Referer': `https://ngl.link/${username}`,
            'Origin': 'https://ngl.link'
        };

        const body = `username=${encodeURIComponent(username)}&question=${encodeURIComponent(pesan)}&deviceId=${deviceId}&gameSlug=&referrer=`;

        try {
            const response = await axios.post('https://ngl.link/api/submit', body, {
                headers,
                timeout
            });

            if (response.status === 200) {
                successCount++;
                
                // Update progres setiap 25 request agar tidak membanjiri chat
                if (i % 25 === 0 && i !== jumlah) {
                    conn.sendMessage(m.chat, {
                        text: `🔄 *Progress:* ${i}/${jumlah}\n✅ Berhasil: ${successCount} | ⚠️ RL: ${rateLimitedCount}`
                    }, { quoted: m });
                }
            }
        } catch (err) {
            // Penanganan Error & Rate Limit
            if (err.response) {
                if (err.response.status === 429) {
                    rateLimitedCount++;
                    // Jika Rate Limit, tunggu 15-20 detik sebelum lanjut
                    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 15000));
                    continue; 
                } else if (err.response.status === 404 && i === 1) {
                    // Pre-flight check: Jika request pertama langsung 404, kemungkinan user tidak ada
                    return m.reply(`❌ *Operasi dibatalkan!*\nUsername NGL *${username}* tidak ditemukan atau link sudah tidak aktif.`);
                }
            }
            failedCount++;
        }

        // Humanized Delay: Jeda acak antara 1.5 - 3.5 detik per request untuk bypass deteksi pola
        if (i < jumlah) {
            let humanDelay = Math.floor(Math.random() * 2000) + 1500;
            await new Promise(resolve => setTimeout(resolve, humanDelay));
        }
    }

    // Ringkasan akhir
    let report = `📊 *REKAP SPAM NGL SELESAI* 📊\n\n`;
    report += `🎯 *Target:* ${username}\n`;
    report += `💬 *Pesan:* ${pesan}\n`;
    report += `🔢 *Diminta:* ${jumlah}\n\n`;
    report += `✅ *Berhasil:* ${successCount}\n`;
    report += `⚠️ *Rate Limited:* ${rateLimitedCount}\n`;
    report += `❌ *Gagal:* ${failedCount}\n`;
    
    if (jumlah > 0) {
        let rate = ((successCount / jumlah) * 100).toFixed(2);
        report += `📈 *Success Rate:* ${rate}%\n\n`;
        report += rate > 80 ? `_Operasi sangat sukses!_ 🚀` : `_Banyak yang terblokir oleh NGL Server._ 🛡️`;
    }
    
    m.reply(report);
};

handler.help = ['spamngl', 'sngl'];
handler.tags = ['tools'];
handler.command = /^(spamngl|sngl)$/i;

// Flag Keamanan Bot (Berdasarkan handler.js)
handler.limit = true; // Mengurangi limit
handler.premium = false; // Bisa digunakan user biasa
// handler.token = 2; // (Opsional) Jika ingin menggunakan sistem token di handler Anda

module.exports = handler;