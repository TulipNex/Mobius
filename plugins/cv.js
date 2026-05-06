const { createCanvas, loadImage } = require('canvas')
const { createHash } = require('crypto')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (global.wait) await m.reply(global.wait)

    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.sender))
    
    // Normalisasi JID: Menghapus Device ID (contoh: 628x:2@s.whatsapp.net -> 628x@s.whatsapp.net)
    if (who.includes(':')) {
        let splitId = who.split('@');
        who = splitId[0].split(':')[0] + '@' + (splitId[1] || 's.whatsapp.net');
    }
    if (!who.includes('@')) who += '@s.whatsapp.net'

    let users = global.db.data.users
    if (!users[who]) users[who] = { exp: 0, limit: 10, registered: false, name: '', level: 0, money: 0, role: 'Newbie' }
    
    let user = users[who]
    let username = user.registered ? user.name : await conn.getName(who) || 'User'

    let ppUrl;
    try {
        // RENCANA A: Coba ambil foto Resolusi Tinggi (High-Res) maksimal 3 detik
        ppUrl = await Promise.race([
            conn.profilePictureUrl(who, 'image'),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout High-Res")), 3000))
        ]);
    } catch (e) {
        try {
            // RENCANA B: Jika High-Res macet, coba ambil Resolusi Rendah (Thumbnail)
            ppUrl = await Promise.race([
                conn.profilePictureUrl(who), // tanpa parameter 'image'
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Low-Res")), 3000))
            ]);
        } catch (e2) {
            // RENCANA C: Jika WA menolak memberikan foto (karena privasi/kosong)
            console.log('\n[DEBUG CANVAS] Foto profil gagal diambil (High & Low):', e2.message);
            ppUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=512`;
        }
    }

    let finalImage;
    try {
        const width = 1080;
        const height = 640; 
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Gradient Background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#141E30'); // Biru gelap
        gradient.addColorStop(1, '#243B55'); // Abu-abu kebiruan
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Pola titik-titik transparan
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for(let i=0; i<width; i+=20) {
            for(let j=0; j<height; j+=20) {
                ctx.beginPath();
                ctx.arc(i, j, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let avatarImg;
        try {
            avatarImg = await loadImage(ppUrl);
        } catch (err) {
            console.log('\n[DEBUG CANVAS] Gagal meload gambar/URL:', err.message);
            avatarImg = createCanvas(300, 300);
            let tempCtx = avatarImg.getContext('2d');
            tempCtx.fillStyle = '#cccccc';
            tempCtx.fillRect(0, 0, 300, 300);
        }

        const avatarSize = 300;
        const avatarX = width / 2;
        const avatarY = height / 2 - 50;

        // Border luar (Efek Ring)
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, (avatarSize / 2) + 15, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();

        // Masking Lingkaran
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX - (avatarSize / 2), avatarY - (avatarSize / 2), avatarSize, avatarSize);
        ctx.restore();

        ctx.font = 'bold 55px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        let displayName = username.length > 25 ? username.substring(0, 25) + '...' : username;
        ctx.fillText(displayName, width / 2, avatarY + (avatarSize / 2) + 80);
        
        // Render Role & Level
        ctx.font = '35px Arial';
        ctx.fillStyle = '#a8c0ff';
        ctx.fillText(`Level: ${user.level}  •  Role: ${user.role || 'Newbie'}`, width / 2, avatarY + (avatarSize / 2) + 140);

        finalImage = canvas.toBuffer('image/png');

    } catch (e) {
        console.error("[CANVAS ERROR]", e);
        await m.reply('Maaf, gagal membuat gambar Canvas.');
        return;
    }

    let str = `*Berikut adalah profil dari:* @${who.split('@')[0]}`;
    await conn.sendMessage(m.chat, { 
        image: finalImage, 
        caption: str, 
        mentions: [who] 
    }, { quoted: m });
}

handler.help = ['canvasprofile [@user]']
handler.tags = ['main']
handler.command = /^(canvasprofile|cv)$/i

module.exports = handler