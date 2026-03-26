/**
 * Nama Plugin: Super System Diagnostic
 * Deskripsi: Mendeteksi potensi error, memory leak, NaN corrupt di database, dan status dependencies.
 * Author: Senior WA Bot Developer
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Tambahkan reaksi loading
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });
    await m.reply(global.wait || '⏳ *DIAGNOSTIC SYSTEM INITIATED...*\nMohon tunggu, sedang memindai seluruh sistem bot...');

    let report = `🩺 *B.O.T HEALTH DIAGNOSTIC REPORT* 🩺\n\n`;
    let issuesFound = 0;
    let warnings = [];

    // ==========================================
    // 1. SYSTEM & MEMORY CHECK
    // ==========================================
    report += `*💻 1. SYSTEM & MEMORY*\n`;
    let totalRAM = os.totalmem() / (1024 * 1024);
    let freeRAM = os.freemem() / (1024 * 1024);
    let ramUsage = process.memoryUsage().rss / (1024 * 1024);
    
    if (freeRAM < 150) {
        report += `🔴 *RAM Status:* KRITIS (${freeRAM.toFixed(2)} MB Free)\n`;
        warnings.push("RAM sangat tipis. Potensi bot crash (Out of Memory) sangat tinggi.");
        issuesFound++;
    } else if (freeRAM < 500) {
        report += `🟡 *RAM Status:* WASPADA (${freeRAM.toFixed(2)} MB Free)\n`;
    } else {
        report += `🟢 *RAM Status:* AMAN (${freeRAM.toFixed(2)} MB Free)\n`;
    }
    report += `> Node.js Usage: ${ramUsage.toFixed(2)} MB\n`;
    report += `> Uptime: ${formatUptime(process.uptime())}\n\n`;

    // ==========================================
    // 2. FILE SYSTEM & LEAKS CHECK (TMP FOLDER)
    // ==========================================
    report += `*📂 2. STORAGE & LEAK CHECK*\n`;
    let tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    
    let tmpFiles = fs.readdirSync(tmpDir).length;
    if (tmpFiles > 100) {
        report += `🔴 *Folder Tmp:* MENUMPUK (${tmpFiles} file)\n`;
        warnings.push(`Terdapat ${tmpFiles} file sampah di folder tmp. Ini menandakan fitur autoclear gagal berjalan. Segera ketik ${usedPrefix}cleartmp`);
        issuesFound++;
    } else {
        report += `🟢 *Folder Tmp:* AMAN (${tmpFiles} file)\n`;
    }

    // Check Sessions folder size
    let sessionDir = path.join(process.cwd(), 'sessions'); // Sesuaikan dengan folder session anda
    if (fs.existsSync(sessionDir)) {
        let sessionFiles = fs.readdirSync(sessionDir).length;
        if (sessionFiles > 50) {
            report += `🟡 *Folder Session:* BENGKAK (${sessionFiles} file. Pertimbangkan untuk menghapus selain creds.json)\n`;
            // Kita tidak menambahkan issuesFound disini agar sebatas peringatan ringan
        } else {
            report += `🟢 *Folder Session:* AMAN (${sessionFiles} file)\n`;
        }
    }
    report += `\n`;

    // ==========================================
    // 3. DATABASE INTEGRITY CHECK (ANTI-NAN)
    // ==========================================
    report += `*🗄️ 3. DATABASE INTEGRITY*\n`;
    if (!global.db || !global.db.data) {
        report += `🔴 *Database:* GAGAL DIMUAT!\n`;
        warnings.push("Objek global.db.data tidak ditemukan! Bot tidak bisa menyimpan data RPG/User.");
        issuesFound++;
    } else {
        let nanCount = 0;
        let corruptedUsers = 0;
        let users = global.db.data.users || {};
        
        for (let jid in users) {
            let isCorrupt = false;
            for (let prop in users[jid]) {
                if (Number.isNaN(users[jid][prop])) {
                    nanCount++;
                    isCorrupt = true;
                }
            }
            if (isCorrupt) corruptedUsers++;
        }

        if (nanCount > 0) {
            report += `🔴 *Status:* KORUP DETECTED\n`;
            report += `> ⚠️ Terdapat *${nanCount} nilai NaN* pada *${corruptedUsers} user*.\n`;
            warnings.push("Database RPG mengalami korup (NaN). Hal ini bisa membuat command error. Cek fitur yang melibatkan perkalian/pembagian di RPG.");
            issuesFound++;
        } else {
            // Kalkulasi Chat & Grup Terlebih Dahulu
            let allChats = Object.keys(global.db.data.chats || {});
            let dbGroupChats = allChats.filter(jid => jid.endsWith('@g.us'));
            let privateChats = allChats.length - dbGroupChats.length;
            
            let activeGroups = await conn.groupFetchAllParticipating().catch(() => ({}));
            let activeGroupJids = Object.keys(activeGroups);
            
            let zombieGroups = dbGroupChats.filter(jid => !activeGroupJids.includes(jid)).length;
            
            // PERBAIKAN BUG UI: Ubah status visual jika ada penumpukan grup mati
            if (zombieGroups > 30) {
                report += `🟡 *Status:* WASPADA (Sampah Database)\n`;
                warnings.push(`Terdapat ${zombieGroups} data grup mati (zombie) di database. Ini membuat ukuran file database membengkak.`);
                issuesFound++;
            } else {
                report += `🟢 *Status:* SEHAT & BERSIH\n`;
            }

            report += `> Total Users: ${Object.keys(users).length}\n`;
            report += `> Total Database Chats: ${allChats.length}\n`;
            report += `> ├─ Riwayat PM: ${privateChats}\n`;
            report += `> ├─ Grup Aktif (Server): ${activeGroupJids.length}\n`;
            report += `> └─ Grup Mati/Keluar (DB): ${zombieGroups}\n`;
        }
    }
    report += `\n`;

    // ==========================================
    // 4. DEPENDENCIES & BINARY CHECK
    // ==========================================
    report += `*⚙️ 4. BINARY & TOOLS CHECK*\n`;
    const checkCommand = (cmd) => {
        try { execSync(`${cmd}`, { stdio: 'ignore', timeout: 3000 }); return '🟢 AMAN'; } 
        catch (e) { issuesFound++; return '🔴 HILANG/ERROR'; }
    };
    
    // Mengecek tool wajib untuk bot media
    let ffmpegStatus = checkCommand('ffmpeg -version');
    let magickStatus = checkCommand('magick -version'); // Windows/Modern Linux
    if (magickStatus.includes('HILANG')) magickStatus = checkCommand('convert -version'); // Legacy Linux

    report += `> FFMPEG (Video/Sticker): ${ffmpegStatus}\n`;
    report += `> ImageMagick (Gambar): ${magickStatus}\n`;
    if (ffmpegStatus.includes('HILANG')) warnings.push("FFMPEG tidak terinstal. Fitur konversi media, download video, dan stiker animasi akan gagal total.");
    report += `\n`;

    // ==========================================
    // 5. EXTERNAL API CHECK
    // ==========================================
    report += `*🌐 5. EXTERNAL API CHECK*\n`;
    try {
        let startPing = performance.now();
        let apiRes = await fetch('https://api.botcahx.eu.org', { timeout: 5000 });
        let endPing = performance.now();
        if (apiRes.ok || apiRes.status === 404 || apiRes.status === 403) { 
            // 404/403 berarti server merespon, hanya endpoint root yang dibatasi
            report += `🟢 *Botcahx API:* ONLINE (${Math.round(endPing - startPing)}ms)\n`;
        } else {
            throw new Error("Bad Status");
        }
    } catch (e) {
        report += `🔴 *Botcahx API:* OFFLINE / TIMEOUT\n`;
        warnings.push("API Botcahx sedang down atau terblokir jaringan. Fitur downloader akan mati.");
        issuesFound++;
    }

    // ==========================================
    // 6. EVENT LISTENER LEAK CHECK (Baileys)
    // ==========================================
    let eventCount = 0;
    try {
        if (typeof conn.ev.listenerCount === 'function') {
            eventCount = conn.ev.listenerCount('messages.upsert');
        } else if (typeof conn.ev.listeners === 'function') {
            eventCount = conn.ev.listeners('messages.upsert').length;
        } else if (conn.ev._events && conn.ev._events['messages.upsert']) {
            let evs = conn.ev._events['messages.upsert'];
            eventCount = Array.isArray(evs) ? evs.length : 1;
        }
    } catch (e) {
        eventCount = 0; // Fallback yang aman jika API event emitter berbeda
    }

    if (eventCount > 5) {
        report += `\n🔴 *EVENT LEAK:* Terdeteksi ${eventCount} listener pada 'messages.upsert'.\n`;
        warnings.push("Memory Leak Baileys terdeteksi! Event pesan menumpuk berulang kali. Ini akan melambatkan bot seiring waktu. Pertimbangkan merestart bot.");
        issuesFound++;
    }

    // ==========================================
    // KESIMPULAN & REKOMENDASI
    // ==========================================
    report += `\n──────────────────\n`;
    if (issuesFound === 0) {
        report += `✅ *KESIMPULAN:* Sistem dalam kondisi *SANGAT PRIMA*. Tidak terdeteksi ancaman error di masa depan.`;
    } else {
        report += `⚠️ *KESIMPULAN:* Ditemukan *${issuesFound} Isu Kritis* yang harus segera diperbaiki:\n\n`;
        warnings.forEach((warn, index) => {
            report += `${index + 1}. ${warn}\n`;
        });
    }
    
    // Send Results
    await m.reply(report);
    
    // Tambahkan reaksi sukses
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

// Fungsi helper waktu
function formatUptime(seconds) {
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);
    return `${d}h ${h}j ${m}m ${s}d`;
}

handler.help = ['diagnostic', 'cekbot'];
handler.tags = ['owner'];
handler.command = /^(diagnostic|cekbot)$/i;

// Mengamankan command hanya untuk owner agar tidak dieksploitasi user biasa
handler.owner = true;
handler.private = false;

module.exports = handler;