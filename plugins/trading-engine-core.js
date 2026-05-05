/**
 * TULIPNEX TRADING ENGINE COMMANDS
 * Location: ./plugins/trading-engine-core.js
 * Feature: Mengontrol dan memonitor Engine yang berjalan di /lib
 */

const { startEngine, eventPool } = require('../lib/trading-engine.js');
const delay = ms => new Promise(res => setTimeout(res, ms));

// ==========================================
// INISIALISASI MESIN GLOBAL SAAT PLUGIN DIMUAT
// ==========================================
startEngine();

let handler = async (m, { conn, command }) => {
    let action = (command || '').toLowerCase();
    
    if (!global.db.data.settings) global.db.data.settings = {};
    if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
    let market = global.db.data.settings.trading;

    let activeChatsCount = Object.values(global.db.data.chats || {}).filter(chat => chat.tradingNews).length;

    // ==========================================
    // COMMAND: .enginestatus
    // ==========================================
    if (action === 'enginestatus') {
        let status = global.tradingCron ? "🟢 AKTIF (NODE-CRON via LIB)" : "🔴 MATI / ERROR";
        let announcerStatus = activeChatsCount > 0 ? `📡 Aktif di ${activeChatsCount} Grup` : `🔇 Dimatikan`;
        let lastSync = market.lastMinuteMarker || "Belum sinkronisasi";

        let eventText = "Normal (Tidak ada event)";
        if (market.activeEvent && market.activeEvent.title !== 'STABLE') {
            eventText = String.fromCharCode(9888) + ' ' + market.activeEvent.title + ' (' + market.activeEvent.ticker + ') - Sisa: ' + market.activeEvent.dur + 'm';
        }

        let vaultBalance = (market.vault || 0).toLocaleString('id-ID');

        let pricesText = "";
        if (market.prices && global.marketConfig) {
            for (let t in global.marketConfig) {
                let current = market.prices[t];
                let prev = (market.prevPrices && market.prevPrices[t]) ? market.prevPrices[t] : current;
                let diff = current - prev;
                let emoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➖');
                pricesText += `│ ${t}: Rp ${current.toLocaleString('id-ID')} ${emoji}\n`;
            }
        } else {
            pricesText = "│ _Belum ada data harga_\n";
        }

        let caption = `⚙️ *SYSTEM MONITOR: TULIPNEX ENGINE*\n`;
        caption += `──────────────────\n`;
        caption += `🔌 *Status Mesin:* \n> ${status}\n`;
        caption += `⏱️ *Last Sync (WITA):* \n> ${lastSync}\n`;
        caption += `📢 *News Broadcast:* \n> ${announcerStatus}\n`;
        caption += `──────────────────\n`;
        caption += `🌍 *Active Event:*\n> ${eventText}\n`;
        caption += `💰 *Brankas (Vault):*\n> Rp ${vaultBalance}\n`;
        caption += `──────────────────\n`;
        caption += `📊 *Live Prices:*\n${pricesText}`;
        caption += `──────────────────\n`;
        caption += `_Sistem terdesentralisasi berjalan di background melalui modul terpisah._`;

        return m.reply(caption);
    }

    // ==========================================
    // COMMAND: .forceevent
    // ==========================================
    if (action === 'forceevent') {
        if (!eventPool || eventPool.length === 0) return m.reply(`[!] Tidak ada data event di lib/trading-events.js`);
        if (activeChatsCount === 0) return m.reply(`[!] Belum ada grup yang mengaktifkan .setnews`);

        let rawEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
        market.activeEvent = { ...rawEvent };
        market.eventHistory = market.eventHistory || [];
        market.eventHistory.push({ title: rawEvent.title, time: Date.now() });
        market.eventCooldown = 120;
        
        let news = `📢 *TULIPNEX NEWS FLASH (FORCED)*\n──────────────────\n📰 *Event:* ${rawEvent.title}\n💬 ${rawEvent.msg}\n🎯 *Impact:* ${rawEvent.ticker}\n⏳ *Durasi:* ${rawEvent.dur} Menit\n──────────────────`;

        let activeGroupJids = Object.entries(global.db.data.chats).filter(([jid, chat]) => chat.tradingNews).map(([jid]) => jid);

        m.reply(`✅ *MANUAL OVERRIDE BERHASIL*\nEvent *${rawEvent.title}* dipicu secara paksa!\nMenyiarkan ke *${activeChatsCount}* grup...`);

        for (let jid of activeGroupJids) {
            try {
                await conn.reply(jid, news, null);
                await delay(500);
            } catch (err) { }
        }
    }
}

handler.help = ['enginestatus', 'forceevent'];
handler.tags = ['god'];
handler.command = /^(enginestatus|forceevent)$/i;
handler.owner = true;

module.exports = handler;