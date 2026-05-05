/**
 * TULIPNEX TOP TRADERS LEADERBOARD
 * Location: ./plugins/trading-leaderboard.js
 * Feature: Kalkulasi Total Net Worth (Uang Tunai + Nilai Portofolio Aset)
 */

let handler = async (m, { conn }) => {
    if (!global.marketConfig) return m.reply('[!] Sistem TulipNex sedang dimuat, harap coba lagi.');

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    let prices = market.prices || {};

    let users = Object.entries(global.db.data.users);
    let traderStats = [];

    // Kalkulasi Kekayaan Bersih (Net Worth) setiap pemain
    for (let [jid, data] of users) {
        let money = data.money || 0;
        let portfolioValue = 0;

        // Hitung nilai setiap aset berdasarkan harga pasar saat ini
        for (let ticker in global.marketConfig) {
            let itemName = global.marketConfig[ticker].db;
            let count = data[itemName] || 0;
            let currentPrice = prices[ticker] || global.marketConfig[ticker].initialPrice;
            portfolioValue += (count * currentPrice);
        }

        let netWorth = money + portfolioValue;

        // Hanya masukkan pemain yang punya kekayaan lebih dari 0
        if (netWorth > 0) {
            traderStats.push({
                jid: jid,
                name: data.name || conn.getName(jid) || 'Unknown Trader',
                money: money,
                portfolio: portfolioValue,
                netWorth: netWorth
            });
        }
    }

    if (traderStats.length === 0) {
        return m.reply('📉 Belum ada investor di pasar TulipNex.');
    }

    // Urutkan dari yang paling kaya (Descending)
    traderStats.sort((a, b) => b.netWorth - a.netWorth);

    // Ambil Top 10
    let topTraders = traderStats.slice(0, 10);

    let text = `🏆 *TULIPNEX FORBES TOP 10*\n`;
    text += `_Peringkat Investor Terkaya_\n`;
    text += `──────────────────\n`;

    topTraders.forEach((trader, index) => {
        let rank = index + 1;
        let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '💼';
        
        text += `${medal} *${trader.name}*\n`;
        text += `🏛️ Net Worth: \n> Rp ${trader.netWorth.toLocaleString()}\n`;
        text += `💵 Cash: \n> Rp ${trader.money.toLocaleString()}\n`;
        text += `📦 Asset: \n> Rp ${trader.portfolio.toLocaleString()}\n`;
        
        if (trader.jid === m.sender) {
            text += `   *(📍 Anda di sini)*\n`;
        }
        text += `\n`;
    });

    text += `──────────────────\n`;
    text += `💡 _Net Worth dihitung dari uang tunai + nilai jual seluruh aset di pasar saat ini._`;

    await conn.reply(m.chat, text.trim(), m, {
        contextInfo: {
            mentionedJid: topTraders.map(t => t.jid) 
        }
    });
}

handler.help = ['toptrader', 'forbes']
handler.tags = ['tulipnex']
handler.command = /^(toptrader|topinvestor|toptulip|forbes)$/i
handler.rpg = true;
handler.group = true;

module.exports = handler;