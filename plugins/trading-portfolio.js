/**
 * TULIPNEX TRADING PORTFOLIO
 * Location: ./plugins/trading-portfolio.js
 * Feature: Check User Asset Holdings & Net Worth
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!global.marketConfig) return m.reply('[!] Sistem TulipNex sedang dimuat, harap coba lagi.');

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
    
    let market = global.db.data.settings.trading;
    market.prices = market.prices || {};

    let user = global.db.data.users[m.sender];
    if (!user) return m.reply('[!] Data pengguna tidak ditemukan di database.');

    let totalAssetValue = 0;
    let caption = `💼 *USER ASSET PORTFOLIO*\n`;
    caption += `_Client: ${user.name}_\n`;
    caption += `──────────────────\n`;
    
    let hasAsset = false;
    for (let ticker in global.marketConfig) {
        let itemName = global.marketConfig[ticker].db; // Mengambil dari Engine
        let count = user[itemName] || 0;
        let currentPrice = market.prices[ticker] || global.marketConfig[ticker].initialPrice;
        
        if (count > 0) {
            hasAsset = true;
            let assetValue = count * currentPrice;
            totalAssetValue += assetValue;
            caption += `• *${ticker}*: ${count.toLocaleString('id-ID')} unit \n> Rp ${assetValue.toLocaleString('id-ID')}\n`;
        }
    }
    
    if (!hasAsset) caption += `_Anda belum memiliki aset apapun._\n`;
    
    caption += `──────────────────\n`;
    caption += `💵 *Liquid Cash*: \n> Rp ${user.money.toLocaleString('id-ID')}\n`;
    caption += `🏛️ *Total Networth*: \n> Rp ${(user.money + totalAssetValue).toLocaleString('id-ID')}\n`;
    
    return m.reply(caption);
}

handler.help = ['portfolio'];
handler.tags = ['tulipnex'];
handler.command = /^(pf|porto|portfolio)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;