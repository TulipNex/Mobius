const { getContentType } = require('@adiwajshing/baileys')

let handler = async (m, { conn }) => {
    // Validasi input: pastikan user me-reply sebuah pesan
    if (!m.quoted) {
        return m.reply('Reply pesan yang mau dijadikan story/status grup dulu ya!');
    }

    try {
        await m.reply(global.wait);

        // 1. Ekstraksi tipe pesan saat ini (bisa dari helper simple.js atau bawaan Baileys)
        const type = m.mtype || getContentType(m.message);
        
        // 2. Mencari quotedMessage di dalam contextInfo secara bertahap (Fallback System)
        // Coba jalur standar: m.message[tipepesan].contextInfo.quotedMessage
        // Coba jalur extended: m.message.extendedTextMessage.contextInfo.quotedMessage
        let quotedRaw = m.message[type]?.contextInfo?.quotedMessage || 
                        m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // 3. Jika jalur native gagal, ambil dari objek 'm.quoted.message' yang sudah diparsing oleh handler/simple.js
        if (!quotedRaw && m.quoted) {
            // Bisa berada di m.quoted.message atau m.quoted.fakeObj.message
            quotedRaw = m.quoted.message || m.quoted?.fakeObj?.message;
        }

        // 4. Final checking
        if (!quotedRaw) {
            return m.reply('Gagal mengambil data pesan murni. Pesan yang di-reply mungkin tidak valid atau tidak memiliki struktur media/teks yang didukung.');
        }

        // Logic relay khusus untuk Group Status Message (swgc)
        let temp = {
            groupStatusMessageV2: {
                message: quotedRaw
            }
        };
        
        // Looping untuk membentuk buffer pembungkus status message
        for (let i = 0; i < 5; i++) {
            temp = {
                groupStatusMessageV2: {
                    message: temp
                }
            };
        }

        // Mengirimkan payload ke grup menggunakan relayMessage
        await conn.relayMessage(m.chat, temp, {});

        await m.reply(`✅ Berhasil upload story/status grup!`);

    } catch (err) {
        console.error('[SWGC ERROR]', err);
        m.reply(`*${global.eror}*\n\nGagal memproses: ${err.message}`);
    }
}

handler.help = ['swgc', 'statusgc', 'storygc'].map(v => v + ' <reply pesan>')
handler.tags = ['group']
handler.command = /^(swgc|statusgc|storygc)$/i

// Flag keamanan sesuai standard modular
handler.group = true
handler.admin = true

module.exports = handler;