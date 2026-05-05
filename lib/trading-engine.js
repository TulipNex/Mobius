/**
 * TULIPNEX TRADING ENGINE LIBRARY
 * Location: ./lib/trading-engine.js
 * Feature: Core Logic AMM, Market Config, Cron Volatility, & Staking Engine
 */

const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const cron = require('node-cron');

const delay = ms => new Promise(res => setTimeout(res, ms));

const eventPath = path.join(process.cwd(), 'lib', 'trading-events.js');
let eventPool = [];
if (fs.existsSync(eventPath)) {
    eventPool = require(eventPath);
}

// ==========================================
// KONFIGURASI ASET TERDESENTRALISASI & STAKING
// ==========================================
global.marketConfig = {
    IVL: { initialPrice: 5000, circulatingSupply: 10000000, impactRatio: 0.10, volatility: 0.03, db: 'ivylink', apy: 500 },
    LBT: { initialPrice: 100000, circulatingSupply: 5000000, impactRatio: 0.15, volatility: 0.05, db: 'lilybit', apy: 1500 },
    IRC: { initialPrice: 1000000, circulatingSupply: 1000000, impactRatio: 0.20, volatility: 0.05, db: 'iriscode', apy: 5000 },
    LTN: { initialPrice: 10000000, circulatingSupply: 500000, impactRatio: 0.25, volatility: 0.06, db: 'lotusnet', apy: 15000 },
    RSX: { initialPrice: 100000000, circulatingSupply: 100000, impactRatio: 0.30, volatility: 0.07, db: 'rosex', apy: 50000 },
    TNX: { initialPrice: 1000000000, circulatingSupply: 50000, impactRatio: 0.40, volatility: 0.08, db: 'tulipnex', apy: 200000 }
};

// ==========================================
// GLOBAL TRADE ENGINE
// ==========================================
if (!global.tradeEngine) {
    global.tradeEngine = {
        /**
         * 1. MARKET MAKER: Eksekusi perubahan harga berdasarkan Transaksi
         */
        executeTransaction: function (ticker, amount, type = 'buy') {
            let market = global.db.data?.settings?.trading;
            let c = global.marketConfig[ticker];
            
            if (!market || !market.prices || !c) return false;

            let oldPrice = market.prices[ticker];
            
            let txAmount = type === 'buy' ? amount : -amount;
            let priceShift = 1 + (c.impactRatio * (txAmount / c.circulatingSupply));
            let newPrice = Math.max(1, Math.round(oldPrice * priceShift));

            market.prices[ticker] = newPrice;
            
            if (!market.ath) market.ath = {};
            if (newPrice > (market.ath[ticker] || 0)) {
                market.ath[ticker] = newPrice;
            }

            return { oldPrice, newPrice, diff: newPrice - oldPrice };
        },

        /**
         * 2. STAKING ENGINE: Kalkulasi Estimasi Profit
         */
        getStakingReward: function (user, ticker) {
            if (!user.staking || !user.staking[ticker]) return 0;
            
            let stakeData = user.staking[ticker];
            let c = global.marketConfig[ticker];
            if (!c || !c.apy) return 0;

            let timePassed = (Date.now() - stakeData.lastHarvest) / 3600000; // Kalkulasi dalam jam
            return Math.floor(timePassed * stakeData.amount * c.apy);
        },

        /**
         * 3. STAKING ENGINE: Panen Spesifik (1 Ticker)
         */
        harvestStaking: function (user, ticker) {
            let reward = this.getStakingReward(user, ticker);
            if (reward > 0) {
                user.money += reward;
                user.staking[ticker].lastHarvest = Date.now(); // Reset waktu setelah di-ekstrak
            }
            return reward;
        },

        /**
         * 4. STAKING ENGINE: Panen Keseluruhan Aset (All Tickers)
         */
        harvestAll: function (user) {
            let totalReward = 0;
            let details = {};
            
            if (!user.staking) return { total: 0, details };
            
            for (let t in user.staking) {
                let r = this.harvestStaking(user, t);
                if (r > 0) {
                    totalReward += r;
                    details[t] = r;
                }
            }
            return { total: totalReward, details };
        }
    };
}

// ==========================================
// BACKGROUND WORKER (NODE-CRON)
// ==========================================
function startEngine() {
    if (!global.tradingCron) {
        console.log('🚀 [TulipNex] Cron Engine Started from /lib/trading-engine.js...');
        
        global.tradingCron = cron.schedule('* * * * *', async () => {
            try {
                if (!global.db.data.settings) global.db.data.settings = {};
                if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
                let market = global.db.data.settings.trading;
                if (!global.conn) return;

                let nowTz = moment().tz('Asia/Makassar');
                market.prices = market.prices || {};
                market.history = market.history || {};
                market.ath = market.ath || {};
                market.eventHistory = market.eventHistory || []; 
                market.eventCooldown = market.eventCooldown || 0;

                for (let k in global.marketConfig) {
                    if (!market.prices[k]) market.prices[k] = global.marketConfig[k].initialPrice;
                }

                let news = "";
                market.activeEvent = market.activeEvent || { title: 'STABLE', dur: 0 };
                
                if (market.activeEvent.dur > 0) {
                    market.activeEvent.dur -= 1;
                } else {
                    market.activeEvent = { title: 'STABLE', msg: 'Normal', ticker: null, mult: 1, dur: 0 };
                    if (market.eventCooldown > 0) market.eventCooldown -= 1;
                }

                if (market.activeEvent.title === 'STABLE' && market.eventCooldown <= 0 && Math.random() < 0.0055) {
                    if (eventPool.length > 0) {
                        let rawEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
                        market.activeEvent = { ...rawEvent };
                        market.lastCanceledEvent = null; 
                        market.eventHistory.push({ title: rawEvent.title, time: Date.now() });
                        market.eventCooldown = 120; 

                        news = `📢 *TULIPNEX NEWS FLASH*\n──────────────────\n📰 *Event:* ${rawEvent.title}\n💬 ${rawEvent.msg}\n🎯 *Impact:* ${rawEvent.ticker}\n⏳ *Durasi:* ${rawEvent.dur} Menit\n──────────────────`;
                    }
                }

                market.prevPrices = { ...market.prices };
                
                for (let t in global.marketConfig) {
                    let c = global.marketConfig[t];
                    let currentPrice = market.prices[t];
                    
                    let upChance = (market.activeEvent.ticker === 'GLOBAL' || market.activeEvent.ticker === t) ? (market.activeEvent.mult > 0 ? 0.8 : 0.2) : 0.5;
                    
                    let direction = Math.random() < upChance ? 1 : -1;
                    let volatilityShift = Math.random() * c.volatility; 
                    
                    let newPrice = currentPrice * (1 + (direction * volatilityShift));
                    market.prices[t] = Math.max(1, Math.round(newPrice));

                    if (!market.history[t]) market.history[t] = [];
                    market.history[t].push(market.prices[t]);
                    if (market.history[t].length > 10) market.history[t].shift();
                    
                    if (!market.ath[t]) market.ath[t] = market.prices[t];
                    if (market.prices[t] > market.ath[t]) market.ath[t] = market.prices[t];
                }

                market.lastMinuteMarker = nowTz.format('YYYY-MM-DD HH:mm');
                market.lastUpdate = Date.now();

                if (news) {
                    let activeGroupJids = Object.entries(global.db.data.chats).filter(([jid, chat]) => chat.tradingNews).map(([jid]) => jid);
                    for (let jid of activeGroupJids) {
                        try {
                            await global.conn.reply(jid, news, null);
                            await delay(500); 
                        } catch (err) {}
                    }
                }

            } catch (e) {
                console.error('❌ [TulipNex] Cron Engine Error:', e);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Makassar"
        });
    }
}

module.exports = {
    startEngine,
    eventPool
};