let handler = async (m, { conn }) => {
    try {
        // Mendapatkan info user dari database global jika ada
        let user = global.db.data.users[m.sender] || {};
        // Mendapatkan profil kontak dari WhatsApp
        let contact = await conn.onWhatsApp(m.sender);
        // Mendapatkan nama dan status pengguna lewat API WhatsApp
        let v = conn.getName(m.sender);
        let status = 'Tidak tersedia';

        // Coba ambil status/biografi dari profil user (jika didukung)
        try {
            const statusObj = await conn.getStatus(m.sender);
            status = statusObj?.status || status;
        } catch {
            // Jika gagal ambil status, tetap tampilkan default
        }

        let message = `✨ Profil User ✨\n\n` +
                      `📛 Nama : ${v}\n` +
                      `📱 Nomor : ${m.sender.split('@')[0]}\n` +
                      `📝 Status : ${status}`;

        m.reply(message);
    } catch (e) {
        m.reply('Maaf Yuuki, terjadi kesalahan saat mengambil data profil.');
    }
}

handler.help = ['ila']
handler.tags = ['info']
handler.command = /^(ila)$/i

module.exports = handler;