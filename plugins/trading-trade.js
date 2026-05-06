/**
 * TULIPNEX TRADING ENGINE (BUY & SELL)
 * Location: ./plugins/trading-trade.js
 * Update: Removed O(N) Loop, Implemented Event-Driven BOD Trigger
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!global.marketConfig || !global.tradeEngine) {
        return m.reply('[!] Mesin TulipNex belum siap atau sedang dimuat ulang. Harap tunggu.');
    }

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
    
    let market = global.db.data.settings.trading;
    market.vault = market.vault || 0; 
    market.taxRates = market.taxRates || { IVL: 1.5, LBT: 1.5, IRC: 1.5, LTN: 1.5, RSX: 1.5, TNX: 2.5 };

    let user = global.db.data.users[m.sender];
    if (!user) return m.reply('[!] Data pengguna tidak ditemukan.');

    let action = command.toLowerCase();
    let ticker = (args[0] || '').toUpperCase();
    let inputQty = args[1]?.toLowerCase();
    
    let item = global.marketConfig[ticker];

    if (!item) return m.reply(`*[!] Ticker tidak valid.* \n\n Gunakan format \n> ${usedPrefix}${action} <ticker> <jumlah/all> \n Untuk melihat daftar koin \n> ${usedPrefix}ind `);
    if (!inputQty) return m.reply(`[!] Format salah.\n*Cara pakai:* ${usedPrefix}${action} <ticker> <jumlah/all>\n*Contoh:* ${usedPrefix}${action} IVL 10`);

    let currentPrice = market.prices[ticker];
    let varName = item.db; 
    let qty = 0;

    // --- TRANSAKSI BELI (IN) ---
    if (['in', 'buy', 'beli'].includes(action)) {
        qty = inputQty === 'all' ? Math.floor(user.money / currentPrice) : parseInt(inputQty);
        
        if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah tidak valid. Masukkan angka positif atau 'all'.`);
        
        let totalPrice = currentPrice * qty;
        if (user.money < totalPrice) return m.reply(`[!] Dana kurang. Anda butuh Rp ${totalPrice.toLocaleString('id-ID')} untuk membeli ${qty} unit ${ticker}.`);
        
        user.money -= totalPrice;
        user[varName] = (user[varName] || 0) + qty;
        
        let impact = global.tradeEngine.executeTransaction(ticker, qty, 'buy');
        
        // 🔥 PELATUK (TRIGGER) EVENT-DRIVEN CACHING
        // Hanya hitung ulang Top 3 CEO jika yang dibeli adalah TNX
        if (ticker === 'TNX') {
            global.tradeEngine.updateBoardOfDirectors();
        }
        
        let msg = `✅ *BUY ORDER EXECUTED*\n──────────────────\n`;
        msg += `📦 Item: ${ticker}\n`;
        msg += `🔢 Total Beli: ${qty.toLocaleString('id-ID')} unit\n`;
        msg += `💰 Harga Satuan: Rp ${currentPrice.toLocaleString('id-ID')}\n`;
        msg += `💵 Total Biaya: Rp ${totalPrice.toLocaleString('id-ID')}\n`;
        msg += `──────────────────\n`;
        msg += `💶 Saldo Saat Ini: Rp ${user.money.toLocaleString('id-ID')}`;
        return m.reply(msg);
    } 
    
    // --- TRANSAKSI JUAL (EX) ---
    else if (['ex', 'sell', 'jual'].includes(action)) {
        let userOwned = user[varName] || 0;
        qty = inputQty === 'all' ? userOwned : parseInt(inputQty);
        
        if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah tidak valid. Masukkan angka positif atau 'all'.`);
        if (qty > userOwned) return m.reply(`[!] Aset tidak cukup. Anda hanya memiliki ${userOwned.toLocaleString('id-ID')} unit ${ticker}.`);
        
        // 🚀 O(1) PERFORMANCE: Mengambil data CEO dari Cache tanpa me-looping database
        let bod = market.bod || global.tradeEngine.updateBoardOfDirectors();
        let ceoJid = bod.ceo[0];
        let komJid = bod.kom[0];
        let dirJid = bod.dir[0];

        let currentTaxPercent = market.taxRates[ticker] || 1.5; 
        let taxRate = currentTaxPercent / 100;
        let grossPrice = currentPrice * qty;
        let tax = Math.floor(grossPrice * taxRate);
        let taxMsg = `🧾 Pajak Bursa (${currentTaxPercent}%): - Rp ${tax.toLocaleString('id-ID')}`;

        if (m.sender === ceoJid) {
            tax = 0; 
            taxMsg = `👑 Privilege CEO: *Bebas Pajak 100%*`;
        } else if (m.sender === komJid) {
            tax = Math.floor(tax * 0.5); 
            taxMsg = `👔 Privilege Komisaris: *Diskon Pajak 50%* (- Rp ${tax.toLocaleString('id-ID')})`;
        } else if (m.sender === dirJid) {
            tax = Math.floor(tax * 0.75); 
            taxMsg = `💼 Privilege Direktur: *Diskon Pajak 25%* (- Rp ${tax.toLocaleString('id-ID')})`;
        }

        let netGain = grossPrice - tax;
        market.vault = (market.vault || 0) + tax; 

        user.money += netGain;
        user[varName] -= qty;
        
        let impact = global.tradeEngine.executeTransaction(ticker, qty, 'sell');
        
        // 🔥 PELATUK (TRIGGER) EVENT-DRIVEN CACHING
        // Hanya hitung ulang Top 3 CEO jika yang dijual adalah TNX
        if (ticker === 'TNX') {
            global.tradeEngine.updateBoardOfDirectors();
        }
        
        let msg = `💹 *SELL ORDER EXECUTED*\n──────────────────\n`;
        msg += `📦 Item: ${ticker}\n`;
        msg += `🔢 Total Jual: ${qty.toLocaleString('id-ID')} unit\n`;
        msg += `💰 Bruto: Rp ${grossPrice.toLocaleString('id-ID')}\n`;
        msg += `${taxMsg}\n`;
        msg += `──────────────────\n`;
        msg += `📉 *Dampak Pasar:* Harga turun menjadi *Rp ${impact.newPrice.toLocaleString('id-ID')}* (Rp ${impact.diff.toLocaleString('id-ID')})\n`;
        msg += `💵 Dana Masuk: Rp ${netGain.toLocaleString('id-ID')}\n`;
        msg += `💶 Saldo Saat Ini: Rp ${user.money.toLocaleString('id-ID')}`;
        
        return m.reply(msg);
    }
}

handler.help = ['buy <ticker> <jumlah>', 'sell <ticker> <jumlah>'];
handler.tags = ['tulipnex'];
handler.command = /^(in|buy|beli|ex|sell|jual)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;