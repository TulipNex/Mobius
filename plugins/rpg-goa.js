/**
 * Nama Plugin: RPG Jelajah Goa (Dungeon)
 * Deskripsi: Game simulasi menjelajahi goa untuk mencari harta karun dengan tombol interaktif.
 * Author: Senior Bot Developer
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    // Konfigurasi Cooldown (5 Menit)
    let cooldown = 300000; 
    let timer = (user.lastdungeon || 0) + cooldown;

    // Pengecekan Cooldown
    if (new Date() - (user.lastdungeon || 0) < cooldown) {
        let timeLeft = msToTime(timer - new Date());
        return m.reply(`⏳ *COOLDOWN* \nKamu masih kelelahan setelah menjelajahi goa. Silakan istirahat dan kembali dalam *${timeLeft}* lagi.`);
    }

    // Pengecekan Syarat Darah & Stamina
    if (user.health < 20) {
        return m.reply(`❤️ *DARAH TERLALU RENDAH*\nDarah kamu sisa ${user.health}%. Kamu bisa mati jika memaksakan diri masuk ke dalam goa yang gelap!\n\n> 💡 *Ketik ${usedPrefix}heal* untuk memulihkan darah.`);
    }
    if (user.stamina < 15) {
        return m.reply(`⚡ *STAMINA HABIS*\nStamina kamu sisa ${user.stamina}%. Kamu terlalu lelah untuk berpetualang!\n\n> 💡 *Makan sesuatu* atau istirahat terlebih dahulu.`);
    }

    // Mengurangi stamina setiap kali masuk goa
    user.stamina -= 10;
    
    await conn.sendMessage(m.chat, { react: { text: '🔦', key: m.key } });
    
    // Gacha Skenario Goa
    let scenarios = [
        'epic_treasure', 'rare_treasure', 'common_treasure', 
        'monster_attack', 'trap_room', 'zonk'
    ];
    // Probabilitas (Bisa disesuaikan, Zonk dan Common lebih sering terjadi)
    let weights = [5, 15, 30, 25, 15, 10]; 
    let scenario = getRandomWeighted(scenarios, weights);

    let caption = `🦇 *EKSPLORASI GOA GELAP* 🦇\n\n`;
    let footer = `TulipNex RPG Ecosystem`;

    // Variabel Reward / Punishment
    let getExp = 0, getMoney = 0, getDiamond = 0, getEmas = 0, getBerlian = 0, getIron = 0, getRock = 0;
    let loseHealth = 0;

    // Logika Skenario
    switch (scenario) {
        case 'epic_treasure':
            getDiamond = Math.floor(Math.random() * 5) + 1;
            getBerlian = Math.floor(Math.random() * 3) + 1;
            getMoney = Math.floor(Math.random() * 50000) + 10000;
            getExp = Math.floor(Math.random() * 2000) + 500;
            
            caption += `✨ *JACKPOT! RUANGAN RAHASIA!* ✨\n`;
            caption += `Kamu tidak sengaja menginjak saklar rahasia dan menemukan tumpukan harta peninggalan raja kuno!\n\n`;
            caption += `🎁 *REWARD:*\n`;
            caption += `💎 Diamond: +${getDiamond}\n`;
            caption += `💠 Berlian: +${getBerlian}\n`;
            caption += `💵 Uang: +Rp ${getMoney.toLocaleString('id-ID')}\n`;
            caption += `✨ EXP: +${getExp}`;
            break;

        case 'rare_treasure':
            getEmas = Math.floor(Math.random() * 10) + 2;
            getIron = Math.floor(Math.random() * 15) + 5;
            getMoney = Math.floor(Math.random() * 10000) + 2000;
            getExp = Math.floor(Math.random() * 800) + 200;
            
            caption += `💰 *HARTA KARUN MENENGAH* 💰\n`;
            caption += `Kamu menemukan sebuah peti berdebu di balik air terjun bawah tanah.\n\n`;
            caption += `🎁 *REWARD:*\n`;
            caption += `🪙 Emas: +${getEmas}\n`;
            caption += `⛓️ Iron: +${getIron}\n`;
            caption += `💵 Uang: +Rp ${getMoney.toLocaleString('id-ID')}\n`;
            caption += `✨ EXP: +${getExp}`;
            break;

        case 'common_treasure':
            getRock = Math.floor(Math.random() * 50) + 10;
            getIron = Math.floor(Math.random() * 5) + 1;
            getExp = Math.floor(Math.random() * 300) + 50;
            
            caption += `⛏️ *LORONG TAMBANG TINGGALAN* ⛏️\n`;
            caption += `Kamu masuk ke area bekas tambang dan memulung beberapa sumber daya alam.\n\n`;
            caption += `🎁 *REWARD:*\n`;
            caption += `🪨 Batu: +${getRock}\n`;
            caption += `⛓️ Iron: +${getIron}\n`;
            caption += `✨ EXP: +${getExp}`;
            break;

        case 'monster_attack':
            loseHealth = Math.floor(Math.random() * 30) + 15;
            getExp = Math.floor(Math.random() * 1500) + 500; // Dapat EXP karena bertarung
            
            caption += `👹 *SERANGAN MONSTER GOA!* 👹\n`;
            caption += `Seekor monster kelelawar raksasa menyerangmu dari atas! Kamu berhasil membunuhnya tapi terluka cukup parah.\n\n`;
            caption += `🩸 *PENGORBANAN:*\n`;
            caption += `❤️ Darah: -${loseHealth}%\n`;
            caption += `✨ Combat EXP: +${getExp}`;
            break;

        case 'trap_room':
            loseHealth = Math.floor(Math.random() * 20) + 10;
            let loseMoney = Math.floor(Math.random() * 5000) + 1000;
            
            // Cek agar minus uang tidak membuat saldo jadi minus
            if (user.money < loseMoney) loseMoney = user.money;
            user.money -= loseMoney;

            caption += `⚠️ *TERKENA JEBAKAN!* ⚠️\n`;
            caption += `Kamu salah melangkah dan memicu panah beracun! Kamu panik dan dompetmu terjatuh saat melarikan diri.\n\n`;
            caption += `🩸 *KERUGIAN:*\n`;
            caption += `❤️ Darah: -${loseHealth}%\n`;
            caption += `💸 Uang Hilang: -Rp ${loseMoney.toLocaleString('id-ID')}`;
            break;

        case 'zonk':
            caption += `🕸️ *GOA KOSONG* 🕸️\n`;
            caption += `Kamu menyusuri goa selama berjam-jam, namun hanya menemukan sarang laba-laba dan tulang belulang... Kamu pulang dengan tangan hampa.`;
            break;
    }

    // Terapkan penambahan dan pengurangan ke database pengguna
    user.diamond += getDiamond;
    user.berlian += getBerlian;
    user.emas += getEmas;
    user.iron += getIron;
    user.rock += getRock;
    user.money += getMoney;
    user.exp += getExp;
    
    // Kurangi darah jika terkena damage
    user.health -= loseHealth;
    if (user.health < 0) user.health = 0; // Prevent minus health

    // Set lastdungeon agar cooldown aktif
    user.lastdungeon = new Date() * 1;

    // Menampilkan Pesan Menggunakan Format Button
    await conn.sendMessage(m.chat, {
        text: caption,
        footer: footer,
        buttons: [
            {
                buttonId: `${usedPrefix}${command}`,
                buttonText: { displayText: '🧭 Jelajah Lagi' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}heal`,
                buttonText: { displayText: '💊 Heal Darah' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}inv`,
                buttonText: { displayText: '🎒 Inventory' },
                type: 1
            }
        ],
        headerType: 1
    }, { quoted: m });
};

// --- Helper Configuration ---
handler.help = ['exploregoa', 'goa'];
handler.tags = ['rpg'];
handler.command = /^(exploregoa|goa|jelajah)$/i;
handler.rpg = true;    // Hanya berjalan jika fitur RPG diaktifkan
handler.limit = true;  // Membutuhkan 1 limit bot setiap bermain

module.exports = handler;

// --- Helper Functions ---
function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return `${hours > 0 ? hours + ' Jam ' : ''}${minutes > 0 ? minutes + ' Menit ' : ''}${seconds > 0 ? seconds + ' Detik' : ''}`.trim();
}

function getRandomWeighted(items, weights) {
    let totalWeight = weights.reduce((acc, val) => acc + val, 0);
    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (let i = 0; i < items.length; i++) {
        weightSum += weights[i];
        if (randomNum <= weightSum) return items[i];
    }
    return items[items.length - 1];
}