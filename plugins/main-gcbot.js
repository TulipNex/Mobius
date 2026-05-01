const axios = require('axios'); // Pastikan axios tersedia untuk download gambar

let handler = async (m, { conn, usedPrefix, command }) => {
    // Memunculkan pesan loading 
    m.reply(global.wait || 'Loading...')

    try {
        // Mengambil tautan grup dari variabel global
        let gcLink = global.gc || "https://chat.whatsapp.com/Futdln0tFp2Jf0uSkp9o1O?mode=gi_t";
        
        // Mengekstrak kode invite menggunakan Regex
        let inviteCode = gcLink.match(/chat\.whatsapp\.com\/([\w\d]+)/i)?.[1];
        
        if (!inviteCode) {
            return m.reply(`*Tautan Grup:*\n${gcLink}`);
        }

        // Fetch informasi (metadata) grup 
        let groupInfo = await conn.groupGetInviteInfo(inviteCode);
        let groupId = groupInfo.id;
        
        // Mengambil URL foto profil grup, fallback ke gambar default jika tidak ada
        let ppGroup = await conn.profilePictureUrl(groupId, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');

        // Download gambar untuk dijadikan thumbnail besar (cover)
        let { data: thumbBuffer } = await axios.get(ppGroup, { responseType: 'arraybuffer' });

        // Mengirim pesan Tipe Group Invite (Undangan Grup Native)
        // Tipe ini secara default dari WhatsApp-nya merender kotak dengan tombol "Lihat grup" di bawah.
        await conn.sendMessage(m.chat, {
            groupInvite: {
                groupJid: groupId, // ID Grup
                inviteCode: inviteCode, // Kode tautan
                inviteExpiration: parseInt(new Date().getTime() / 1000) + 86400 * 3, // Kedaluwarsa dlm 3 hari (opsional)
                groupName: 'Wann Bot Official', // Judul sesuai screenshot
                caption: 'Grup di "TulipNex Inc."', // Sub-judul sesuai screenshot
                jpegThumbnail: Buffer.from(thumbBuffer) // Foto sebagai cover raksasa
            }
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        // Fallback jika terjadi error API
        m.reply(`*Grup Official:*\n${global.gc || "https://chat.whatsapp.com/Futdln0tFp2Jf0uSkp9o1O?mode=gi_t"}`);
    }
}

handler.help = ['gcbot']
handler.tags = ['main']
handler.command = /^(gcbot)$/i

module.exports = handler