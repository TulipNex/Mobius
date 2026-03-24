/**
 * Plugin Instagram Downloader
 * Feature: Photo, Video, Reels, & Profile Info
 */

const { igDownload, igProfile } = require('../lib/igScraper');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*Format salah!*\n\n*Download Media:* \n${usedPrefix + command} https://www.instagram.com/p/xxxx\n\n*Cek Profil:* \n${usedPrefix + command} username`);
    }

    // Deteksi jika input adalah URL Instagram
    const isUrl = args[0].match(/(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reels|reel|tv|share)\/([^/?#&]+))/gi);

    if (isUrl) {
        await m.reply(global.wait || '_Sedang mengunduh media, mohon tunggu..._');
        try {
            const results = await igDownload(args[0]);
            
            if (!results || results.length === 0) throw 'Media tidak ditemukan atau akun bersifat privat.';

            for (let res of results) {
                if (res.type === 'video') {
                    await conn.sendFile(m.chat, res.url, 'ig.mp4', `🎬 *Instagram Video/Reels*`, m);
                } else {
                    await conn.sendFile(m.chat, res.url, 'ig.jpg', `📸 *Instagram Photo*`, m);
                }
            }
        } catch (e) {
            console.error(e);
            m.reply(`⚠️ *Gagal:* ${e.message || 'Terjadi kesalahan saat mengunduh.'}`);
        }
    } else {
        // Jika input bukan URL, asumsikan itu Username untuk cek profil
        await m.reply(global.wait || '_Mencari informasi profil..._');
        try {
            const data = await igProfile(args[0]);

            let caption = `👤 *INSTAGRAM PROFILE*\n\n`;
            caption += `┌  *Nama:* ${data.name || '-'}\n`;
            caption += `│  *Username:* @${data.username}\n`;
            caption += `│  *Verified:* ${data.is_verified ? '✅' : '❌'}\n`;
            caption += `│  *Private:* ${data.is_private ? '🔒' : '🔓'}\n`;
            caption += `│  *Followers:* ${data.followers.toLocaleString()}\n`;
            caption += `│  *Following:* ${data.following.toLocaleString()}\n`;
            caption += `└  *Posts:* ${data.posts.toLocaleString()}\n\n`;
            caption += `📝 *Bio:* _${data.bio || '-'}_`;

            await conn.sendFile(m.chat, data.pp, 'pp.jpg', caption, m);
        } catch (e) {
            console.error(e);
            m.reply(`⚠️ Gagal mengambil data profil @${args[0].replace('@', '')}. Pastikan username benar.`);
        }
    }
};

handler.help = ['tomat <url/user>'];
handler.tags = ['downloader'];
handler.command = /^(tomat)$/i;
handler.limit = true; 

module.exports = handler;