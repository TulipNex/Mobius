/**
 * TULIPNEX TRADING INDICATOR
 * Location: ./plugins/trading-indicator.js
 * Feature: Market Indicator & Ticker History
 */

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // Pastikan engine sudah dimuat
    if (!global.marketConfig) return m.reply('[!] Sistem TulipNex sedang dimuat, harap coba lagi.');

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
    
    let market = global.db.data.settings.trading;
    market.prices = market.prices || {};
    market.prevPrices = market.prevPrices || {};
    market.history = market.history || {};
    market.ath = market.ath || {};
    market.activeEvent = market.activeEvent || { title: 'STABLE', msg: 'Pasar berjalan normal.', ticker: null, mult: 1, dur: 0 };
    market.taxRates = market.taxRates || { IVL: 1.5, LBT: 1.5, IRC: 1.5, LTN: 1.5, RSX: 1.5, TNX: 2.5 };

    let user = global.db.data.users[m.sender];
    if (!user) return m.reply('[!] Data pengguna tidak ditemukan di database.');

    let now = Date.now();
    let currentTime = new Date(now).toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA';

    let totalAssetValue = 0;
    for (let ticker in global.marketConfig) {
        let count = user[global.marketConfig[ticker].db] || 0;
        totalAssetValue += count * (market.prices[ticker] || 0);
    }

    let targetTicker = args[0]?.toUpperCase();
    
    // DETAIL INDIKATOR 1 TICKER SPESIFIK
    if (targetTicker && global.marketConfig[targetTicker]) {
        let curr = market.prices[targetTicker] || global.marketConfig[targetTicker].initialPrice;
        let prev = market.prevPrices[targetTicker] || curr;
        let ath = market.ath[targetTicker] || curr;
        
        let rawHist = market.history[targetTicker] || [curr];
        let displayHist = Array.isArray(rawHist) ? [...rawHist] : [curr];

        if (displayHist.length === 0 || displayHist[displayHist.length - 1] !== curr) displayHist.push(curr);
        
        // Menampilkan 10 menit terakhir
        displayHist = displayHist.slice(-10).reverse();

        let diff = curr - prev;
        let percent = prev > 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';
        let emoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➖');
        let sign = diff > 0 ? '+' : '';
        let currentTax = market.taxRates[targetTicker] || 1.5;

        let caption = `📊 *DETAIL INDIKATOR: ${targetTicker}*\n`;
        caption += `🕒 *Update:* ${currentTime}\n`;
        caption += `──────────────────\n`;
        caption += `💸 Harga: Rp ${curr.toLocaleString('id-ID')}\n`;
        caption += `📊 Perubahan: ${emoji} ${sign}${percent}%\n`;
        caption += `🧾 Pajak Jual Dasar: *${currentTax}%*\n`;
        caption += `──────────────────\n`;
        
        caption += `📜 *Riwayat Harga (10 aksi terakhir):*\n`;
        displayHist.forEach((p, i) => { caption += `${i + 1}. Rp ${p.toLocaleString('id-ID')} (${i === 0 ? 'Sekarang' : `Lalu`})\n`; });
        caption += `──────────────────\n`;
        if (market.activeEvent.ticker === 'GLOBAL' || market.activeEvent.ticker === targetTicker) {
            caption += `📢 *EVENT AKTIF:* \n> _${market.activeEvent.title}_\n🌍 *Scope:* \n> _${market.activeEvent.ticker}_\n⏳ *Sisa:* \n> _${market.activeEvent.dur} m_\n──────────────────\n`;
        }
        caption += `*Milik Anda:* ${(user[global.marketConfig[targetTicker].db] || 0).toLocaleString('id-ID')} unit\n`;
        return m.reply(caption);
    }

    // INDIKATOR GLOBAL SELURUH MARKET
    let caption = `📊 *TULIPNEX MARKET INDICATOR*\n`;
    caption += `🕒 *Update:* ${currentTime}\n`;
    caption += `──────────────────\n`;
    
    let mktStatus = 'NORMAL';
    if (market.activeEvent.ticker === 'GLOBAL') mktStatus = '⚠️ GLOBAL EVENT';
    else if (market.activeEvent.ticker !== null) mktStatus = `⚠️ LOCAL EVENT (${market.activeEvent.ticker})`;
    
    caption += `🌍 *Market Status:* ${mktStatus}\n`;
    caption += `📰 *News:* _${market.activeEvent.msg}_\n`;
    caption += `──────────────────\n`;
    caption += `💶 *Cash*: Rp ${user.money.toLocaleString('id-ID')}\n`; 
    caption += `💼 *Portfolio*: Rp ${totalAssetValue.toLocaleString('id-ID')}\n`;
    caption += `──────────────────\n`;
    
    for (let ticker in global.marketConfig) {
        let curr = market.prices[ticker] || global.marketConfig[ticker].initialPrice;
        let prev = market.prevPrices[ticker] || curr;
        let diff = curr - prev;
        let percent = prev > 0 ? ((diff / prev) * 100).toFixed(2) : '0.00';
        let emoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➖');
        let sign = diff > 0 ? '+' : '';
        let tax = market.taxRates[ticker] || 1.5;
        let owned = user[global.marketConfig[ticker].db] || 0;

        caption += `*${ticker}* | Tax: ${tax}%\n`;
        caption += `│ 💰 Rp ${curr.toLocaleString('id-ID')}\n`;
        caption += `│ ${emoji} ${sign}${diff.toLocaleString('id-ID')} (${sign}${percent}%)\n`;
        caption += `│ 📦 Anda: ${owned.toLocaleString('id-ID')} unit\n`;
        caption += `──────────────────\n`;
    }
    caption += `\n*INSTRUKSI:*\n`
    caption += `- *Beli Aset :* \n> ${usedPrefix}in <ticker> <jumlah/all> \n`
    caption += `- *Jual Aset :* \n> ${usedPrefix}ex <ticker> <jumlah/all> \n`
    caption += `- *Grafik Harga :* \n> ${usedPrefix}grafik <ticker> \n`
    caption += `- *Event & Riwayat :* \n> ${usedPrefix}ind <ticker> \n\n`
    
    return m.reply(caption);
}

handler.help = ['ind', 'indicator', 'tmi'];
handler.tags = ['tulipnex'];
handler.command = /^(ind(icator)?|tmi)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;