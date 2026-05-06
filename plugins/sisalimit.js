let handler = async (m, { conn }) => {
    try {
        let user = global.db.data.users[m.sender];
        if (!user) return m.reply('Data pengguna tidak ditemukan.');

        // Ambil sisa limit user, jika belum ada di database, anggap 0
        let sisaLimit = user.limit ?? 0;

        m.reply(`Hai ${m.name || 'User'}, sisa limit kamu saat ini adalah *${sisaLimit}* kali penggunaan.`);
    } catch (e) {
        m.reply(global.eror);
        console.error(e);
    }
}

handler.help = ['sisalimit']
handler.tags = ['info']
handler.command = /^(sisalimit)$/i

module.exports = handler