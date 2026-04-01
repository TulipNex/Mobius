/**
 * Plugin: Spotify Downloader
 * Adapted for Baileys Base Framework
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // 1. Validasi Input
    const url = text?.trim() || args[0];

    if (!url) {
        return m.reply(
            `🎵 *sᴘᴏᴛɪꜰʏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ \`${usedPrefix}${command} <url>\`\n` +
            `╰┈┈⬡`
        );
    }

    // 2. Validasi URL Spotify Track
    if (!/open\.spotify\.com\/track/i.test(url)) {
        return m.reply('❌ URL tidak valid. Pastikan Anda mengirimkan link Track Spotify yang benar.');
    }

    // 3. Loading State (Reaksi dan Pesan Wait)
    try { await conn.sendMessage(m.chat, { react: { text: '🕕', key: m.key } }); } catch (e) {}
    await m.reply(global.wait);

    // 4. Eksekusi API & Pengiriman Data
    try {
        // Fetch data menggunakan node-fetch standar
        const response = await fetch(`https://api.nexray.web.id/downloader/v1/spotify?url=${encodeURIComponent(url)}`);
        const dl = await response.json();

        if (!dl || !dl.result || !dl.result.url) {
            throw new Error('Gagal mendapatkan metadata audio dari API.');
        }

        // Ekstraksi Metadata
        const audioUrl = dl.result.url;
        const title = dl.result.title || 'Unknown Title';
        const artist = dl.result.artist?.[0] || 'Unknown Artist';
        const thumbnail = dl.result.thumbnail || 'https://telegra.ph/file/70e8de9b1879568954f09.jpg';

        // Mengirimkan Audio dengan externalAdReply UI
        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${artist} - ${title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: artist,
                    thumbnailUrl: thumbnail,
                    mediaType: 1, // 1 = Image/Link Preview
                    sourceUrl: url,
                    renderLargerThumbnail: true // UX tambahan: Memperbesar thumbnail Spotify
                }
            }
        }, { quoted: m });

        // Reaksi Sukses
        try { await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); } catch (e) {}

    } catch (e) {
        // Reaksi Gagal & Handling Error
        try { await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); } catch (e) {}
        console.error(e);
        m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${e.message || global.eror}`);
    }
}

// ==========================================
// METADATA PLUGIN
// ==========================================
handler.help = ['alpukat'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(alpukat)$/i;

handler.limit = true;   // Memotong limit user (sebagai pengganti energi: 1)
handler.register = true; // Opsional: Pastikan user sudah register

module.exports = handler;