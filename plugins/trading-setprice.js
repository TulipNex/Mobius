/**
 * TULIPNEX MARKET MANIPULATOR (Admin Tool)
 * Location: ./plugins/trading-setprice.js
 * Description: Memungkinkan Owner untuk meretas dan mengatur harga ticker secara manual.
 */

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    if (!global.marketConfig) return m.reply('[!] Mesin TulipNex belum termuat sempurna.');

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading || !global.db.data.settings.trading.prices) {
        return m.reply('[!] Sistem TulipNex belum aktif. Biarkan Engine berjalan terlebih dahulu.');
    }

    let market = global.db.data.settings.trading;

    if (args.length < 2) {
        let guide = `⚙️ *MARKET MANIPULATOR GUIDE*\n`;
        guide += `──────────────────\n`;
        guide += `Gunakan perintah ini untuk meretas harga pasar secara instan.\n\n`;
        guide += `*Format:* ${usedPrefix}${command} <Ticker> <Harga>\n`;
        guide += `*Contoh:* ${usedPrefix}${command} TNX 5000000000`;
        return m.reply(guide);
    }

    let ticker = args[0].toUpperCase();
    let newPrice = parseInt(args[1]);

    if (!global.marketConfig[ticker] || market.prices[ticker] === undefined) {
        return m.reply(`[!] Ticker *${ticker}* tidak ditemukan di bursa TulipNex.`);
    }

    if (isNaN(newPrice) || newPrice <= 0) {
        return m.reply(`[!] Harga baru harus berupa angka positif yang valid (Minimal 1).`);
    }

    // Eksekusi Intervensi Pasar
    let oldPrice = market.prices[ticker];
    market.prices[ticker] = newPrice;
    
    // Perbarui riwayat agar grafik indikator tidak error
    if (!market.history[ticker]) market.history[ticker] = [];
    market.history[ticker].push(newPrice);
    if (market.history[ticker].length > 15) market.history[ticker].shift();

    // Perbarui ATH (All-Time High)
    if (newPrice > (market.ath[ticker] || 0)) market.ath[ticker] = newPrice;

    // Laporan Sukses
    let res = `⚠️ *MARKET INTERVENTION SUCCESS*\n`;
    res += `──────────────────\n`;
    res += `📦 Ticker: *${ticker}*\n`;
    res += `📉 Harga Lama: Rp ${oldPrice.toLocaleString()}\n`;
    res += `📈 Harga Baru: Rp ${newPrice.toLocaleString()}\n`;
    res += `──────────────────\n`;
    res += `_Akses Root dikonfirmasi. Harga telah dimanipulasi secara paksa._`;

    return m.reply(res);
}

handler.help = ['setprice <ticker> <harga>']
handler.tags = ['god']
handler.command = /^(setprice|setharga|injectprice)$/i
handler.owner = true; 
handler.private = true;

module.exports = handler;