/**
 * TULIPNEX CYBER-GREENHOUSE (STAKING / FARMING)
 * Location: ./plugins/trading-staking.js
 * Feature: Interface Staking User dengan fitur Stake ALL / Unstake ALL
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    user.staking = user.staking || {}; // Inisialisasi kebun pemain

    // Validasi apakah Engine Pusat sudah dimuat dengan benar
    if (!global.marketConfig || !global.tradeEngine) {
        return m.reply('[!] Sistem Mesin Trading belum termuat sempurna. Harap tunggu beberapa detik.');
    }

    let action = command.toLowerCase();

    // ===================================
    // COMMAND 1: .stake / .tanam 
    // ===================================
    if (action === 'stake' || action === 'tanam') {
        if (args.length < 1) {
            let guide = `🌱 *CARA MENANAM ASET (STAKING)*\n──────────────────\n`;
            guide += `Kunci aset Anda untuk mendapatkan profit per jam.\n\n`;
            guide += `*Format:* ${usedPrefix}${command} <ticker> <jumlah/all>\n`;
            guide += `*Contoh 1:* ${usedPrefix}${command} TNX 10\n`;
            guide += `*Contoh 2:* ${usedPrefix}${command} TNX all\n`;
            guide += `*Contoh 3:* ${usedPrefix}${command} ALL _(Tanam semua koin di dompet)_\n\n`;
            guide += `*Daftar Ticker:* IVL, LBT, IRC, LTN, RSX, TNX`;
            return m.reply(guide);
        }

        let tickerOrAll = args[0].toUpperCase();

        // LOGIKA: .tanam ALL (Sapu Bersih Dompet)
        if (tickerOrAll === 'ALL') {
            let count = 0;
            let msg = `🌱 *STAKE ALL EXECUTED*\n──────────────────\n`;
            
            for (let t in global.marketConfig) {
                let dbName = global.marketConfig[t].db;
                let amountToStake = user[dbName] || 0;
                
                if (amountToStake > 0) {
                    user[dbName] -= amountToStake;
                    
                    if (!user.staking[t]) {
                        user.staking[t] = { amount: 0, lastHarvest: Date.now() };
                    } else {
                        // Panen dulu sisa profit lama agar fair
                        global.tradeEngine.harvestStaking(user, t);
                    }
                    
                    user.staking[t].amount += amountToStake;
                    msg += `• *${t}*: ${amountToStake.toLocaleString('id-ID')} unit\n`;
                    count++;
                }
            }
            
            if (count === 0) return m.reply(`[!] Dompet Anda kosong. Tidak ada aset yang bisa ditanam.`);
            
            msg += `──────────────────\n✅ Seluruh aset berhasil dipindahkan ke kebun!`;
            return m.reply(msg);
        }

        // LOGIKA: .tanam <ticker> <jumlah/all>
        if (args.length < 2) return m.reply(`[!] Format salah. Ketik *${usedPrefix}${command}* untuk bantuan.`);
        
        let ticker = tickerOrAll;
        if (!global.marketConfig[ticker]) return m.reply(`[!] Ticker tidak valid. Daftar: IVL, LBT, IRC, LTN, RSX, TNX`);
        
        let itemDb = global.marketConfig[ticker].db;
        let inputQty = args[1].toLowerCase();
        let qty = inputQty === 'all' ? (user[itemDb] || 0) : parseInt(inputQty);

        if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah aset tidak valid.`);
        if ((user[itemDb] || 0) < qty) return m.reply(`[!] Aset tidak cukup. Anda hanya punya ${(user[itemDb] || 0).toLocaleString('id-ID')} ${ticker}.`);

        // Pindahkan aset dari dompet ke kebun (staking)
        user[itemDb] -= qty;
        
        if (!user.staking[ticker]) {
            user.staking[ticker] = { amount: 0, lastHarvest: Date.now() };
        } else {
            // Gunakan Engine Pusat untuk memanen profit sebelumnya agar kalkulasi tetap fair
            global.tradeEngine.harvestStaking(user, ticker);
        }

        user.staking[ticker].amount += qty;

        let msg = `🌱 *CYBER-GREENHOUSE TULIPNEX*\n──────────────────\n`;
        msg += `Berhasil menanam *${qty.toLocaleString('id-ID')} ${ticker}*.\n`;
        msg += `Estimasi: *Rp ${global.marketConfig[ticker].apy.toLocaleString('id-ID')} / jam* per unit.\n`;
        msg += `Ketik *${usedPrefix}kebun* untuk memantau status tanaman Anda!`;
        return m.reply(msg);
    }

    // ===================================
    // COMMAND 2: .unstake / .cabut
    // ===================================
    if (action === 'unstake' || action === 'cabut') {
        if (args.length < 1) {
            let guide = `🚜 *CARA MENCABUT ASET (UNSTAKE)*\n──────────────────\n`;
            guide += `Tarik kembali aset yang sedang ditanam ke brankas utama.\n\n`;
            guide += `*Format:* ${usedPrefix}${command} <ticker> <jumlah/all>\n`;
            guide += `*Contoh 1:* ${usedPrefix}${command} TNX 10\n`;
            guide += `*Contoh 2:* ${usedPrefix}${command} TNX all\n`;
            guide += `*Contoh 3:* ${usedPrefix}${command} ALL _(Cabut semua tanaman)_\n`;
            return m.reply(guide);
        }

        let tickerOrAll = args[0].toUpperCase();

        // LOGIKA: .cabut ALL (Cabut Semua Tanaman)
        if (tickerOrAll === 'ALL') {
            if (Object.keys(user.staking).length === 0) return m.reply(`[!] Kebun Anda kosong. Tidak ada yang bisa dicabut.`);

            // Minta Engine Pusat mengeksekusi panen keseluruhan sebelum dicabut
            let rewardRes = global.tradeEngine.harvestAll(user);

            let msg = `🚜 *UNSTAKE ALL EXECUTED*\n──────────────────\n`;
            let count = 0;

            for (let t in user.staking) {
                let stakeAmount = user.staking[t].amount;
                if (stakeAmount > 0) {
                    let itemDb = global.marketConfig[t].db;
                    user[itemDb] = (user[itemDb] || 0) + stakeAmount; // Kembalikan ke dompet
                    msg += `• *${t}*: ${stakeAmount.toLocaleString('id-ID')} unit\n`;
                    count++;
                }
                delete user.staking[t]; // Bersihkan lahan
            }

            msg += `──────────────────\n`;
            if (rewardRes.total > 0) {
                msg += `💰 Sisa profit (Rp ${rewardRes.total.toLocaleString('id-ID')}) otomatis masuk ke kas.\n`;
            }
            msg += `✅ Seluruh tanaman berhasil dicabut dan dikembalikan ke dompet.`;
            return m.reply(msg);
        }

        // LOGIKA: .cabut <ticker> <jumlah/all>
        if (args.length < 2) return m.reply(`[!] Format salah. Ketik *${usedPrefix}${command}* untuk bantuan.`);

        let ticker = tickerOrAll;
        if (!global.marketConfig[ticker]) return m.reply(`[!] Ticker tidak valid.`);
        
        let currentStake = user.staking[ticker] ? user.staking[ticker].amount : 0;
        let inputQty = args[1].toLowerCase();
        let qty = inputQty === 'all' ? currentStake : parseInt(inputQty);

        if (isNaN(qty) || qty <= 0 || currentStake < qty) {
            return m.reply(`[!] Gagal. Anda hanya memiliki ${currentStake.toLocaleString('id-ID')} ${ticker} yang sedang ditanam.`);
        }

        // Minta Engine Pusat mengeksekusi panen sebelum aset dicabut
        let reward = global.tradeEngine.harvestStaking(user, ticker);

        // Kembalikan aset ke dompet utama
        let itemDb = global.marketConfig[ticker].db;
        user.staking[ticker].amount -= qty;
        user[itemDb] += qty;

        if (user.staking[ticker].amount === 0) delete user.staking[ticker];

        let msg = `🚜 Berhasil mencabut *${qty.toLocaleString('id-ID')} ${ticker}* dari kebun ke dompet Anda.\n`;
        if (reward > 0) msg += `Sisa profit (Rp ${reward.toLocaleString('id-ID')}) otomatis masuk ke saldo kas Anda.`;
        return m.reply(msg);
    }

    // ===================================
    // COMMAND 3: .kebun (HANYA MELIHAT STATUS)
    // ===================================
    if (action === 'kebun' || action === 'garden') {
        let msg = `🚜 *STATUS CYBER-GREENHOUSE*\n──────────────────\n`;
        let count = 0;
        let totalEstimated = 0;
        let totalRate = 0; 

        for (let t in user.staking) {
            let stakeData = user.staking[t];
            let apy = global.marketConfig[t].apy;
            
            let timePassed = (Date.now() - stakeData.lastHarvest) / 3600000;
            let ratePerJam = stakeData.amount * apy; 
            
            // Tanya Engine Pusat berapa total hadiah yang tersedia saat ini
            let reward = global.tradeEngine.getStakingReward(user, t);

            msg += `• *${t}*: ${stakeData.amount.toLocaleString('id-ID')} unit\n`;
            msg += `  📈 _Rate: Rp ${ratePerJam.toLocaleString('id-ID')} / jam_\n`;
            msg += `  ⏳ _Waktu: ${timePassed.toFixed(2)} jam_\n`;
            msg += `  💰 _Profit Tersedia: Rp ${reward.toLocaleString('id-ID')}_\n\n`;

            totalEstimated += reward;
            totalRate += ratePerJam;
            count++;
        }

        if (count === 0) return m.reply(`[!] Kebun Anda masih kosong.\nGunakan *${usedPrefix}tanam ALL* untuk menanam seluruh koin Anda.`);

        msg += `──────────────────\n`;
        msg += `💡 Total Rate: *Rp ${totalRate.toLocaleString('id-ID')} / jam*\n`;
        msg += `💡 Total Estimasi Profit: *Rp ${totalEstimated.toLocaleString('id-ID')}*\n`;
        msg += `Ketik *${usedPrefix}panen* untuk mengklaim semua profit ke brankas tunai Anda.`;
        
        return m.reply(msg);
    }

    // ===================================
    // COMMAND 4: .panen (MENGKLAIM PROFIT)
    // ===================================
    if (action === 'panen' || action === 'harvest') {
        if (Object.keys(user.staking).length === 0) {
            return m.reply(`[!] Anda belum menanam (stake) aset apa pun di kebun.`);
        }

        // Engine Pusat secara otomatis memanen keseluruhan kebun
        let res = global.tradeEngine.harvestAll(user);

        if (res.total === 0) return m.reply(`[!] Belum ada profit yang bisa dipanen. Tunggu beberapa saat lagi agar bunganya tumbuh.`);

        let msg = `🚜 *HASIL PANEN HARI INI*\n──────────────────\n`;
        for (let t in res.details) {
            msg += `• *${t}*: + Rp ${res.details[t].toLocaleString('id-ID')}\n`;
        }
        msg += `──────────────────\n`;
        msg += `✅ Berhasil memanen total uang tunai *Rp ${res.total.toLocaleString('id-ID')}* ke brankas utama Anda!`;
        
        return m.reply(msg);
    }
}

handler.help = ['tanam', 'cabut', 'kebun', 'panen']
handler.tags = ['tulipnex']
handler.command = /^(stake|tanam|unstake|cabut|panen|harvest|kebun|garden)$/i
handler.rpg = true
handler.group = true

module.exports = handler;