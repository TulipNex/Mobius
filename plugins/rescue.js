let handler = async (m, { conn }) => {
    try {
         await m.reply('🔍 Memulai X-Ray Memori (RAM) V2...');

        // 1. Mencari lokasi file claude di cache
        let claudeFunc = null;
        let foundKey = "";
        for (let key in require.cache) {
            // Memastikan yang diambil BUKAN dari folder plugins
            if ((key.includes('claude.js') || key.includes('claude (1).js')) && !key.includes('plugins') && !key.includes('ai-claude')) {
                claudeFunc = require.cache[key].exports;
                foundKey = key;
                break;
            }
        }

        if (!claudeFunc || typeof claudeFunc !== 'function') {
            return m.reply(`❌ Gagal. Fungsi tidak valid di RAM.\nKey: ${foundKey}`);
        }

        const axios = require('axios');
        const originalPost = axios.post; // Simpan fungsi asli

        let extractedData = {};

        // 3. Kita "BAJAK" fungsi axios.post
        axios.post = async function(url, data, config) {
            // Ekstraksi ORG_ID dari URL API Claude
            // Format: https://claude.ai/api/organizations/ORG_ID/chat_conversations
            let orgMatch = url.match(/organizations\/([^\/]+)/);
            if (orgMatch) extractedData.ORG_ID = orgMatch[1];

            // Ekstraksi Cookies, Device ID, dan Anon ID dari Headers
            if (config && config.headers) {
                extractedData.COOKIE = config.headers['cookie'] || 'Tidak ditemukan';
                extractedData.DEVICE_ID = config.headers['anthropic-device-id'] || 'Tidak ditemukan';
                extractedData.ANON_ID = config.headers['anthropic-anonymous-id'] || 'Tidak ditemukan';
            }

            // Kembalikan fungsi axios ke kondisi semula agar bot tidak rusak
            axios.post = originalPost;

            // Batalkan pengiriman internet asli dengan melempar error
            throw new Error("BERHASIL_DIEKSTRAK");
        };

        // 4. Kita pancing fungsi claude di RAM untuk berjalan
        try {
            await claudeFunc("Pancingan untuk mengeluarkan data dari RAM", []);
        } catch (err) {
            if (err.message !== "BERHASIL_DIEKSTRAK") {
                console.error("Rescue Error:", err);
            }
        }

        // Pastikan axios dikembalikan ke normal untuk jaga-jaga jika gagal terpotong
        axios.post = originalPost;

        // 5. Cetak Hasilnya!
        if (extractedData.ORG_ID || extractedData.COOKIE) {
            let txt = `✅ *DATA BERHASIL DISELAMATKAN DARI RAM*\n\n`;
            txt += `*ORG_ID:* ${extractedData.ORG_ID}\n`;
            txt += `*DEVICE_ID:* ${extractedData.DEVICE_ID}\n`;
            txt += `*ANON_ID:* ${extractedData.ANON_ID}\n\n`;
            txt += `*COOKIES:*\n${extractedData.COOKIE}\n\n`;
            txt += `_Silakan copy data di atas, lalu masukkan kembali ke file lib/claude.js yang baru!_`;
            await m.reply(txt);
        } else {
            await m.reply('❌ Berhasil mencegat fungsi, tapi datanya kosong. Pastikan Anda sudah menyimpannya sebelumnya.');
        }

    } catch (e) {
        m.reply('❌ Terjadi kesalahan sistem rescue: ' + e.toString());
    }
};

handler.help = ['rescueclaude'];
handler.tags = ['owner'];
handler.command = /^(rescueclaude)$/i;
handler.owner = true; // Hanya Anda (Owner) yang bisa melihat data sensitif ini

module.exports = handler;