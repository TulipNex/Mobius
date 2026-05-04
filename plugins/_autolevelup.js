const { color } = require('../lib/color')
const levelling = require('../lib/levelling')

module.exports = {
    async before(m, { conn, isCommand }) {
        let user = global.db.data.users[m.sender]
        let chat = global.db.data.chats[m.chat] || {}

        // Validasi: Abaikan jika tidak ada user, atau user mematikan autolevelup
        if (!user || !user.autolevelup) return true

        // (Opsional) Anti-Spam Grup: Hanya kirim notif jika itu adalah command ATAU grup mengizinkan RPG
        // Jika tidak ingin bot nyepam di chat biasa, uncomment baris di bawah ini:
        // if (m.isGroup && !isCommand && !chat.rpg) return true

        // Fallback multiplier jika tidak diset di global
        let multiplier = global.multiplier || 36 
        
        let beforeLevel = user.level * 1

        // Kalkulasi kenaikan level (jika exp melonjak drastis, bisa naik beberapa level sekaligus)
        while (levelling.canLevelUp(user.level, user.exp, multiplier)) {
            user.level++
        }

        // Jika level berubah (naik)
        if (beforeLevel !== user.level) {
            let chating = `🎊 *L E V E L  U P !*\n\n> 📈 *Level:* ${beforeLevel} ➔ *${user.level}*\n> 💬 *Ketik .profile untuk melihat status barumu.*`.trim()
            
            // Kirim pesan dengan reply ke pesan yang membuat dia level up
            await conn.sendMessage(m.chat, { 
                text: chating,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: "System Notification",
                        body: "Congratulations!",
                        thumbnailUrl: "https://telegra.ph/file/70e8de9b1879568954f09.jpg", // Ganti dengan URL gambar level up jika ada
                        sourceUrl: global.gc,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })
            
            // (Opsional) Kirim reaction ke pesan user
            try {
                await conn.sendMessage(m.chat, { react: { text: '🎉', key: m.key } })
            } catch (e) {}

            console.log(color(`[LEVEL UP] ${m.sender.split('@')[0]} naik ke level ${user.level}`, 'pink'))
        }
        
        return true
    }
}