const axios = require('axios');
const crypto = require('crypto');

/**
 * GETCONTACT ALL-IN-ONE PLUGIN
 * Ported & Optimized by Pandora
 */

// Konfigurasi Kunci (Dikonversi dari Python)
const AES_KEY = Buffer.from('e62efa9ff5ebbc08701f636fcb5842d8760e28cc51e991f7ca45c574ec0ab15c', 'hex');
const TOKEN = 'hjiZQ512eb3247fcf22952f1d9b2af80cf0459450e54eb422dd20798c04';
const HMAC_KEY = '2Wq7)qkX~cp7)H|n_tc&o+:G_USN3/-uIi~>M+c ;Oq]E{t9)RC_5|lhAA_Qq%_4';

// Helper Enkripsi AES-256-ECB
function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-ecb', AES_KEY, null);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function decrypt(data) {
    const decipher = crypto.createDecipheriv('aes-256-ecb', AES_KEY, null);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validasi input
    if (!text) return m.reply(`Masukkan nomor telepon!\nContoh: ${usedPrefix + command} 628123456789`);

    // Pesan Loading
    m.reply(global.wait || '_Sedang mencari informasi..._');

    try {
        const cleanPhone = text.replace(/[^0-9]/g, '');
        const ts = Math.floor(Date.now() / 1000).toString();
        const baseUrl = 'https://pbssrv-centralevents.com/v2.5';

        // 1. Logic Request Profil (Search)
        const searchPayload = JSON.stringify({
            countryCode: "ID",
            source: "search",
            token: TOKEN,
            phoneNumber: `+${cleanPhone}`
        });

        const searchSigStr = ts + '-' + searchPayload;
        const searchSig = crypto.createHmac('sha256', HMAC_KEY).update(searchSigStr).digest('base64');
        const searchEncData = encrypt(searchPayload);

        const resSearch = await axios.post(`${baseUrl}/search`, 
            { data: searchEncData }, 
            {
                headers: {
                    'X-App-Version': '4.9.1',
                    'X-Token': TOKEN,
                    'X-Os': 'android 5.0',
                    'X-Client-Device-Id': '14130e29cebe9c39',
                    'X-Req-Timestamp': ts,
                    'X-Req-Signature': searchSig,
                    'X-Encrypted': '1'
                }
            }
        );

        const searchResult = JSON.parse(decrypt(resSearch.data.data));

        // Jika nomor tidak ditemukan
        if (!searchResult.result || !searchResult.result.profile) {
            return m.reply('Informasi nomor tidak ditemukan di database GetContact.');
        }

        const profile = searchResult.result.profile;
        const usage = searchResult.result.subscriptionInfo.usage;

        // 2. Logic Request Tag (Detail)
        const tagPayload = JSON.stringify({
            countryCode: "ID",
            source: "details",
            token: TOKEN,
            phoneNumber: `+${cleanPhone}`
        });

        const tagSigStr = ts + '-' + tagPayload;
        const tagSig = crypto.createHmac('sha256', HMAC_KEY).update(tagSigStr).digest('base64');
        const tagEncData = encrypt(tagPayload);

        const resTags = await axios.post(`${baseUrl}/number-detail`, 
            { data: tagEncData }, 
            {
                headers: {
                    'X-App-Version': '4.9.1',
                    'X-Token': TOKEN,
                    'X-Os': 'android 5.0',
                    'X-Req-Timestamp': ts,
                    'X-Req-Signature': tagSig,
                    'X-Encrypted': '1'
                }
            }
        );

        const tagResult = JSON.parse(decrypt(resTags.data.data));
        const tags = tagResult.result.tags || [];

        // 3. Menyusun Output
        let caption = `*🔍 GETCONTACT RESULT*\n\n`;
        caption += `┌  ◦  *Nama:* ${profile.displayName || 'Tidak Diketahui'}\n`;
        caption += `│  ◦  *Total Tag:* ${profile.tagCount}\n`;
        caption += `└  ◦  *Sisa Kuota:* ${usage.search.remainingCount}/${usage.search.limit}\n\n`;

        if (tags.length > 0) {
            caption += `*Daftar Nama Kontak (Tags):*\n`;
            caption += tags.slice(0, 20).map((t, i) => ` ${i + 1}. ${t.tag}`).join('\n');
            if (tags.length > 20) caption += `\n_...dan ${tags.length - 20} tag lainnya._`;
        } else if (profile.tagCount > 0) {
            caption += `_⚠️ Tag ditemukan, tetapi akun bot bukan premium sehingga detail tag tidak bisa ditarik._`;
        } else {
            caption += `_❌ Tidak ada tag nama untuk nomor ini._`;
        }

        // Kirim Balasan Akhir
        await m.reply(caption);

    } catch (err) {
        console.error('Error GetContact Plugin:', err);
        m.reply(global.eror || '_Terjadi kesalahan saat memproses data._');
    }
};

handler.help = ['getcontact <nomor>'];
handler.tags = ['tools'];
handler.command = /^(getcontact|gc|ceknomor)$/i;

// Fitur keamanan bot
handler.limit = true; 

module.exports = handler;