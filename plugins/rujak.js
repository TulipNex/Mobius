/**
 * Nama Plugin: Bot Debugger & Data Inspector
 * Deskripsi: Alat bantu untuk developer melihat raw object Baileys, 
 * mengecek database spesifik (user, chat, bot), dan test error.
 * Author: Senior WA Bot Developer
 */

let util = require('util');

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // 1. Validasi Input
    if (!args[0]) {
        let menu = `🛠️ *DEVELOPER DEBUGGING TOOLS* 🛠️\n\n`;
        menu += `Plugin ini digunakan untuk menginspeksi *Raw Data* dari Baileys dan Database internal bot.\n\n`;
        menu += `*📌 Opsi yang tersedia:*\n`;
        menu += `• *${usedPrefix}${command} msg* \n> Menampilkan JSON struktur pesan saat ini (Berguna untuk scrape metadata Baileys).\n`;
        menu += `• *${usedPrefix}${command} user [@tag/reply]* \n> Menampilkan isi database spesifik milik user tertentu.\n`;
        menu += `• *${usedPrefix}${command} chat* \n> Menampilkan setting & status database untuk grup/chat ini.\n`;
        menu += `• *${usedPrefix}${command} bot* \n> Menampilkan global settings dari bot.\n`;
        menu += `• *${usedPrefix}${command} error* \n> Memicu simulasi error untuk mengetes sistem handler/log bot.\n\n`;
        menu += `*💡 Contoh Penggunaan:*\n`;
        menu += `Ketik: *${usedPrefix}${command} user* (sambil me-reply pesan target)`;
        
        return m.reply(menu);
    }

    let type = args[0].toLowerCase();

    try {
        await m.reply(global.wait || '⏳ _Memproses data debug..._');

        switch (type) {
            case 'msg':
                // Berguna untuk mencari letak ID, contextInfo, quoted message, dll di Baileys
                m.reply(util.format(m));
                break;

            case 'user':
                // Ambil target dari tag, reply, atau diri sendiri (fallback)
                let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
                let userData = global.db.data.users[who];
                
                if (!userData) return m.reply('❌ Data target tidak ditemukan di dalam `global.db.data.users`.');
                
                let userResult = `👤 *DEBUG DATA USER*\nTarget: @${who.split('@')[0]}\n\n${util.format(userData)}`;
                // Mengirim dengan contextInfo agar tag menjadi biru (clickable)
                conn.sendMessage(m.chat, { text: userResult, mentions: [who] }, { quoted: m });
                break;

            case 'chat':
                // Mengecek status switch (welcome, antilink, rpg, dll) di grup ini
                let chatData = global.db.data.chats[m.chat];
                
                if (!chatData) return m.reply('❌ Data chat tidak ditemukan di `global.db.data.chats`.');
                m.reply(`💬 *DEBUG DATA CHAT*\nChat ID: ${m.chat}\n\n${util.format(chatData)}`);
                break;

            case 'bot':
                // Melihat global settings
                let botData = global.db.data.settings;
                m.reply(`🤖 *DEBUG DATA SETTINGS*\n\n${util.format(botData)}`);
                break;

            case 'error':
                // Memaksa bot mengeluarkan error untuk memastikan handler try-catch berjalan semestinya
                throw new Error("🚨 SIMULASI DEBUG ERROR: Jika Anda melihat pesan ini, berarti sistem penanganan error bot (catch block) Anda berfungsi dengan baik.");
                break;

            default:
                m.reply(`❌ Opsi *${type}* tidak dikenali.\nKetik *${usedPrefix}${command}* tanpa argumen untuk melihat panduan.`);
        }

    } catch (e) {
        // Menangkap dan memformat error agar mudah dibaca di WhatsApp
        let errStr = util.format(e);
        m.reply(`❌ *DEBUG FATAL ERROR*\n\n${errStr}\n\n${global.eror || ''}`);
    }
}

// Metadata Plugin
handler.help = ['debug <opsi>'];
handler.tags = ['owner', 'tools'];
handler.command = /^(debug|inspect|dbg)$/i;

// KEAMANAN: Wajib true! Fitur ini membocorkan raw data yang tidak boleh diakses user biasa.
handler.owner = true; 
handler.group = false; 

module.exports = handler;