let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`Masukkan ID LID yang ingin dicek!\n\nContoh: *${usedPrefix}${command} 249348621369556*`);
    }

    let lid = args[0];
    // Pastikan berakhiran @lid
    if (!lid.endsWith('@lid')) lid += '@lid';

    m.reply(`⏳ Sedang mencari nomor asli untuk LID: ${lid}...`);

    try {
        // Cek langsung ke dalam database internal Baileys untuk LID mapping
        let pn = await conn.signalRepository.lidMapping.getPNForLID(lid);
        
        if (pn) {
            // Bersihkan nomor (menghapus port titik dua jika ada)
            let cleanPn = pn.includes(':') ? pn.split(':')[0] : pn;
            if (!cleanPn.endsWith('@s.whatsapp.net')) cleanPn += '@s.whatsapp.net';
            
            let noWa = cleanPn.replace('@s.whatsapp.net', '');
            
            return m.reply(`✅ *HASIL PENCARIAN*\n\n*LID:* ${lid}\n*Nomor WA:* ${cleanPn}\n*Link WA:* https://wa.me/${noWa}`);
        } 
        
        // Jika tidak ketemu di database internal, coba cek di cache bawaan bot (conn.isLid)
        let cachedPn = conn.isLid.get(lid);
        if (cachedPn) {
            let noWa = cachedPn.replace('@s.whatsapp.net', '');
            return m.reply(`✅ *HASIL PENCARIAN (CACHE)*\n\n*LID:* ${lid}\n*Nomor WA:* ${cachedPn}\n*Link WA:* https://wa.me/${noWa}`);
        }

        // Jika sama sekali tidak ditemukan
        return m.reply(`❌ *TIDAK DITEMUKAN*\n\nNomor asli untuk LID ${lid} tidak ada di memori bot.\n\n*Penyebab:* Bot belum pernah menerima data _LID Mapping_ (pemetaan) dari server WhatsApp untuk pengguna ini, atau cache sudah terhapus saat bot direstart.`);

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi error saat mencoba mencari LID: ${e.message}`);
    }
}

handler.help = ['ceklid <id_lid>'];
handler.tags = ['owner'];
handler.command = /^(ceklid|cekpn|getpn)$/i;
handler.rowner = true; // Hanya owner yang bisa menggunakan perintah ini

module.exports = handler;