/**
 * Plugin Instagram Downloader
 * Feature: Photo, Video, Reels, & Profile Info
 */

const { igDownload, igProfile } = require('../lib/igScraper');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`*Format salah!*\n\nContoh:\n${usedPrefix + command} https://www.instagram.com/p/xxxx\n${usedPrefix + command} username (untuk info profil)`);

    // Deteksi jika input adalah URL
    const isUrl = args[0].match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reels|reel|tv)\/([^/?#&]+))/gi);

    if (isUrl) {
        await m.reply(global.wait || '_Sedang memproses media..._');
        try {
            const results = await igDownload(args[0]);
            
            if (results.length === 0) throw 'Media tidak ditemukan.';

            for (let res of results) {
                if (res.type === 'video') {
                    await conn.sendFile(m.chat, res.url, 'ig.mp4', `*Instagram Video/Reels*`, m);
                } else {
                    await conn.sendFile(m.chat, res.url, 'ig.jpg', `*Instagram Photo*`, m);
                }
            }
        } catch (e) {
            console.error(e);
            m.reply(`⚠️ *Error:* ${e.message || 'Gagal mengunduh media. Akun mungkin privat atau link rusak.'}`);
        }
    } else {
        // Jika input bukan URL, asumsikan itu Username untuk cek profil
        await m.reply(global.wait || '_Mencari informasi profil..._');
        try {
            const data = await igProfile(args[0].replace('@', ''));
            if (typeof data === 'string') return m.reply(data);

            let caption = `👤 *INSTAGRAM PROFILE*\n\n`;
            caption += `┌  *Nama:* ${data.name}\n`;
            caption += `│  *Username:* @${data.username}\n`;
            caption += `│  *Verified:* ${data.is_verified ? '✅' : '❌'}\n`;
            caption += `│  *Private:* ${data.is_private ? '🔒' : '🔓'}\n`;
            caption += `│  *Followers:* ${data.followers.toLocaleString()}\n`;
            caption += `│  *Following:* ${data.following.toLocaleString()}\n`;
            caption += `└  *Posts:* ${data.posts}\n\n`;
            caption += `📝 *Bio:* ${data.bio || '-'}`;

            await conn.sendFile(m.chat, data.pp, 'pp.jpg', caption, m);
        } catch (e) {
            m.reply(`Gagal mengambil data profil @${args[0]}.`);
        }
    }
};

handler.help = ['tomat <url/user>'];
handler.tags = ['downloader'];
handler.command = /^(tomat)$/i;
handler.limit = true; // Menggunakan limit agar tidak spam

module.exports = handler;