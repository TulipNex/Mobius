/**
 * TULIPNEX MARKET RESET TOOL (Admin Only)
 * Location: ./plugins/trading-reset.js
 * Description: Reset harga ke inisial, hapus ATH, atau bersihkan riwayat grafik.
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!global.marketConfig) return m.reply('[!] Mesin TulipNex belum termuat sempurna.');

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) {
        return m.reply('[!] Sistem TulipNex belum aktif.');
    }

    let market = global.db.data.settings.trading;

    if (args.length < 2) {
        let guide = `⚙️ *TULIPNEX RESET MANAGER*\n`;
        guide += `──────────────────\n`;
        guide += `Gunakan perintah ini untuk mereset data pasar secara spesifik.\n\n`;
        guide += `*Format:* ${usedPrefix}${command} <Ticker/ALL> <Data/ALL>\n\n`;
        guide += `*Pilihan Target (Ticker):*\n`;
        guide += `• Ticker valid (IVL, LBT, dll)\n`;
        guide += `• *ALL* (Pilih semua aset)\n\n`;
        guide += `*Pilihan Kategori (Data):*\n`;
        guide += `• *price* (Kembalikan ke harga dasar / initialPrice)\n`;
        guide += `• *ath* (Hapus rekor All-Time High)\n`;
        guide += `• *history* (Hapus riwayat pergerakan grafik)\n`;
        guide += `• *event* (Hentikan event/berita yang sedang berjalan)\n`;
        guide += `• *all* (Reset seluruh data untuk target tersebut)\n\n`;
        guide += `*Contoh:* ${usedPrefix}${command} ALL history`;
        return m.reply(guide);
    }

    let targetTicker = args[0].toUpperCase();
    let targetData = args[1].toLowerCase();
    let validTickers = Object.keys(global.marketConfig);

    if (targetTicker !== 'ALL' && !validTickers.includes(targetTicker)) {
        return m.reply(`[!] Ticker *${targetTicker}* tidak dikenali.`);
    }

    let validData = ['price', 'ath', 'history', 'event', 'all'];
    if (!validData.includes(targetData)) {
        return m.reply(`[!] Kategori data *${targetData}* tidak valid. (Pilih: price/ath/history/event/all)`);
    }

    let tickersToReset = targetTicker === 'ALL' ? validTickers : [targetTicker];

    // Reset Event (Global)
    if (targetData === 'event' || targetData === 'all') {
        market.activeEvent = { title: 'STABLE', msg: 'Pasar berjalan normal.', ticker: null, mult: 1, dur: 0 };
        market.eventCooldown = 0;
    }

    // Loop ke ticker yang ditarget
    for (let t of tickersToReset) {
        let initialPrice = global.marketConfig[t].initialPrice;

        if (targetData === 'price' || targetData === 'all') {
            market.prices[t] = initialPrice;
            market.prevPrices[t] = initialPrice;
            market.history[t] = [initialPrice]; // History juga harus direset
            if (targetData === 'price') market.ath[t] = initialPrice; 
        }

        if (targetData === 'ath' || targetData === 'all') {
            market.ath[t] = market.prices[t];
        }

        if (targetData === 'history') {
            market.history[t] = [market.prices[t]];
        }
    }

    market.lastUpdate = Date.now();

    let res = `🏛️ *TULIPNEX RESET EXECUTED*\n`;
    res += `──────────────────\n`;
    res += `🎯 Target Aset : *${targetTicker}*\n`;
    res += `🗑️ Data Dihapus : *${targetData.toUpperCase()}*\n`;
    res += `──────────────────\n`;
    res += `_Operasi sistem berhasil. Data telah diperbarui di database._`;

    return m.reply(res);
}

handler.help = ['resetmarket <ticker> <data>']
handler.tags = ['god']
handler.command = /^(resetmarket|marketreset)$/i
handler.owner = true;
handler.private = true;

module.exports = handler;