/**
 * TULIPNEX BOARD OF DIRECTORS DASHBOARD
 * Location: ./plugins/trading-ceo.js
 * Update: Replaced O(N) sorting with Cached Data (O(1))
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    market.vault = market.vault || 0;
    market.taxRates = market.taxRates || { IVL: 1.5, LBT: 1.5, IRC: 1.5, LTN: 1.5, RSX: 1.5, TNX: 2.5 };
    market.taxProposal = market.taxProposal || null;

    const validTickers = ['IVL', 'LBT', 'IRC', 'LTN', 'RSX', 'TNX'];

    // 🚀 Ambil data dari Cache (Instan)
    let bod = market.bod || global.tradeEngine.updateBoardOfDirectors();
    let ceo = bod.ceo;
    let kom = bod.kom;
    let dir = bod.dir;

    let isCEO = m.sender === ceo[0];
    let isKomisaris = m.sender === kom[0];
    let isDirektur = m.sender === dir[0];

    let caption = `🏢 *TULIPNEX HEADQUARTERS (BOD)*\n`;
    caption += `──────────────────\n`;
    caption += `Dewan Direksi (Top 3 TNX Holders) memiliki wewenang mengontrol pajak dan menikmati dividen bursa!\n\n`;
    
    caption += `*Direktur Utama (CEO):* ${ceo[0] ? (ceo[1].name || `@${ceo[0].split('@')[0]}`) : 'Kosong'} \n${ceo[0] ? ceo[1].tulipnex.toLocaleString('id-ID') : 0} TNX\n`;
    caption += `\n> *Wewenang:* Mengusulkan tarif pajak bursa.\n`;
    caption += `\n> *Privilege:* Bebas Pajak Jual (100%) & 50% Dividen Vault.\n\n`;

    caption += `*Komisaris Utama:* ${kom[0] ? (kom[1].name || `@${kom[0].split('@')[0]}`) : 'Kosong'} \n${kom[0] ? kom[1].tulipnex.toLocaleString('id-ID') : 0} TNX\n`;
    caption += `\n> *Wewenang:* Hak Veto (ACC/Tolak) usulan pajak CEO.\n`;
    caption += `\n> *Privilege:* Diskon Pajak Jual 50% & 30% Dividen Vault.\n\n`;

    caption += `*Direktur Eksekutif:* ${dir[0] ? (dir[1].name || `@${dir[0].split('@')[0]}`) : 'Kosong'} \n${dir[0] ? dir[1].tulipnex.toLocaleString('id-ID') : 0} TNX\n`;
    caption += `\n> *Wewenang:* Hak Veto (ACC/Tolak) usulan pajak CEO.\n`;
    caption += `\n> *Privilege:* Diskon Pajak Jual 25% & 20% Dividen Vault.\n`;

    caption += `──────────────────\n`;
    caption += `⚖️ *REGULASI PAJAK BURSA SAAT INI*\n`;
    for (let t of validTickers) caption += `• ${t}: *${market.taxRates[t]}%*\n`;

    caption += `\n💰 *BRANKAS PERUSAHAAN*\n`;
    caption += `Total Uang: *Rp ${market.vault.toLocaleString('id-ID')}*\n`;
    
    if (market.taxProposal) {
        caption += `\n⚠️ *USULAN PAJAK TERTUNDA (PENDING)*\n`;
        caption += `CEO mengusulkan pajak *${market.taxProposal.ticker}* menjadi *${market.taxProposal.newTax}%*.\n`;
        caption += `_Menunggu persetujuan Komisaris atau Direktur!_\n`;
    }
    caption += `──────────────────\n`;
    
    let userTNX = global.db.data.users[m.sender]?.tulipnex || 0;
    
    if (isCEO) {
        caption += `*Anda adalah CEO TulipNex Inc.* \n- Ajukan besaran pajak \n> ${usedPrefix}ajukanpajak <ticker/ALL> <persen> \n- Tarik uang dari brankas \n> ${usedPrefix}claimdividen`;
    } else if (isKomisaris || isDirektur) {
        caption += `*Anda adalah Anggota Direksi TulipNex Inc.* \n- ACC aturan pajak CEO \n> ${usedPrefix}setujupajak \n- Veto aturan pajak CEO \n> ${usedPrefix}tolakpajak \n- Tarik uang dari brankas \n> ${usedPrefix}claimdividen`;
    } else {
        caption += `📦 *TNX Milik Anda:* ${userTNX.toLocaleString('id-ID')} unit\n`;
        caption += `_Jadilah 3 besar Whale TNX untuk masuk ke jajaran Eksekutif!_`;
    }

    let mentions = [ceo[0], kom[0], dir[0]].filter(v => v !== null);
    return conn.reply(m.chat, caption, m, { contextInfo: { mentionedJid: mentions } });
}

handler.help = ['ceo', 'bod', 'tulipnexceo'];
handler.tags = ['tulipnex'];
handler.command = /^(ceo|bod|tulipnexceo)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;