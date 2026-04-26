/**
 * Plugin: Cek ID / Nomor
 * Description: Melihat ID, status, dan statistik dasar WhatsApp yang terbaca oleh bot
 * Location: ./plugins/cekid.js
 */

let handler = async (m, { conn, usedPrefix, command, isPrems }) => {
    // Mengambil nama dan nomor pengirim (melewati proses resolver)
    let sender = m.sender || m.key.remoteJid || '';
    let pushname = m.pushName || "Pengguna";

    // Mengambil data user dari global database yang diatur di handler.js
    let user = global.db.data.users[sender] || {};
    
    // Formatting data user
    let limit = isPrems ? 'Unlimited ♾️' : (user.limit || 0);
    let token = user.token || 0;
    let level = user.level || 0;
    let role = user.role || 'Newbie ㋡';

    // Menyusun UI balasan agar rapi dan informatif
    let teks = `👋 Halo *${pushname}*!\n\n`;
    teks += `Sistem keamanan dan resolver bot mendeteksi profil kamu sebagai berikut:\n\n`;
    teks += `┌  ◦ *ID / Nomor* : @${sender.split('@')[0]}\n`;
    teks += `│  ◦ *Level* : ${level}\n`;
    teks += `│  ◦ *Role* : ${role}\n`;
    teks += `│  ◦ *Limit* : ${limit}\n`;
    teks += `└  ◦ *Token* : ${token}\n\n`;

    // Logika resolusi Baileys (Mempertahankan UX asli)
    if (sender.endsWith('@s.whatsapp.net')) {
        teks += `✅ _Resolusi sukses! Nomor aslimu berhasil terbaca._`;
    } else if (sender.endsWith('@lid')) {
        teks += `⚠ _Resolusi gagal/tertunda. Kamu masih terbaca sebagai LID._`;
    }

    // Mengirim pesan dengan metadata contextInfo agar tag berfungsi (Clean Tagging)
    await conn.sendMessage(m.chat, {
        text: teks,
        mentions: [sender],
        contextInfo: {
            mentionedJid: [sender],
            // Opsional: Menambahkan forward attribute agar terlihat lebih rapi
            forwardingScore: 1,
            isForwarded: true
        }
    }, { quoted: m });
}

handler.help = ['cekid', 'myid', 'id']
handler.tags = ['umum']
handler.command = /^(cekid|myid|id)$/i

// Flag keamanan sesuai standard operasional
handler.limit = false   // Tidak memotong limit karena ini fitur utilitas dasar
handler.token = false   // Tidak memotong token
handler.premium = false // Bisa diakses user gratisan
handler.group = false   // Bisa diakses di private chat maupun grup

module.exports = handler;