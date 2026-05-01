const j2download = require('../lib/j2download');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) {
        return m.reply(`*⚠️ Masukkan link yang valid!*\n\n*Contoh penggunaan:*\n${usedPrefix + command} https://www.facebook.com/share/r/1BTNdVx873/`);
    }

    let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;
    if (!urlRegex.test(text)) {
        return m.reply('⚠️ URL tidak valid. Harap masukkan tautan yang benar.');
    }

    // 2. Simulasi Loading menggunakan variabel global
    await m.reply(global.wait);

    try {
        // 3. Eksekusi Web Scraper
        const res = await j2download(text);
        
        // Validasi respon scraper jika kosong atau gagal
        if (!res || !res.data) {
            throw new Error('Gagal memuat detail data atau link tidak dikenali.');
        }

        // Ekstraksi hasil JSON. Struktur API sering kali bervariasi, kita pastikan data aman:
        let title = res.data.title || res.data.source || 'Tidak ada judul';
        let links = res.data.links || res.links || [];

        if (links.length === 0) {
            return m.reply('❌ Maaf, tidak ada tautan unduhan yang dapat diekstrak dari link tersebut.');
        }

        // 4. Merapikan Output Rangkuman untuk User
        let caption = `*🎥 J2DOWNLOADER - MEDIA EXTRACTOR*\n\n`;
        caption += `*📌 Judul:* ${title}\n`;
        caption += `*🔗 Sumber:* ${text}\n\n`;
        caption += `*⬇️ Daftar Unduhan (Manual Link):*\n`;

        links.forEach((link, index) => {
            let quality = link.quality || link.format || 'Default';
            let mediaUrl = link.url || link.download;
            caption += `> ${index + 1}. [${quality}] ${mediaUrl}\n`;
        });
        
        caption += `\n${global.wm}`;

        // 5. Mencoba mengirimkan Media Pertama (Video/Gambar) secara langsung
        // Ambil link download pertama sebagai fallback utama
        let primaryMediaUrl = links[0].url || links[0].download;
        
        if (primaryMediaUrl) {
            try {
                await conn.sendFile(m.chat, primaryMediaUrl, 'downloaded_media', caption, m);
            } catch (mediaError) {
                // Jika file terlalu besar atau format tak didukung, kirim sebagai teks fallback
                console.log('Gagal mengirim media secara langsung:', mediaError);
                m.reply(caption);
            }
        } else {
            // Jika tidak ada URL media yang terdeteksi, kirimkan daftar manual saja
            m.reply(caption);
        }

    } catch (e) {
        console.error(e);
        // Fallback error handle (global.eror)
        m.reply(`${global.eror}\n\n*Detail Error:* ${e.message}`);
    }
}

handler.help = ['alldl', 'j2dl'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(alldl|j2dl|j2download)$/i

// Flag Konfigurasi Fitur
handler.limit = true
handler.group = false

module.exports = handler