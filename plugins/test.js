let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // Gunakan dynamic import untuk menghindari error ERR_REQUIRE_ASYNC_MODULE pada Baileys terbaru
        const { generateWAMessageFromContent } = await import('@adiwajshing/baileys');

        // Teks yang akan dikirim (bisa custom dari user atau default)
        let caption = text || "Ini adalah pesan uji coba dengan badge AI ✨\n\n> Wann Assistant | Powered by TulipNex";

        // 1. Buat kerangka pesan dasar menggunakan Baileys murni
        let msg = await generateWAMessageFromContent(m.chat, {
            extendedTextMessage: {
                text: caption,
                contextInfo: {
                    mentionedJid: [m.sender],
                    isForwarded: true,
                    forwardingScore: 999
                }
            }
        }, { userJid: conn.user.id, quoted: m });

        // 2. Injeksi parameter botMessageSecret ke messageContextInfo (Root level)
        if (!msg.message.messageContextInfo) {
            msg.message.messageContextInfo = {};
        }
        
        // Buffer ini adalah kunci yang dibaca oleh WhatsApp untuk memunculkan badge AI
        msg.message.messageContextInfo.botMessageSecret = Buffer.from("WannBotAI", "utf-8");

        // 3. Kirim pesan menggunakan relayMessage agar struktur raw protobuf terjaga
        await conn.relayMessage(m.chat, msg.message, { 
            messageId: msg.key.id 
        });

    } catch (e) {
        console.error("[Plugin AITest] Error:", e);
        // Menggunakan global.eror jika tersedia, atau pesan fallback
        m.reply(typeof global.eror === 'undefined' ? "❌ Terjadi kesalahan saat mengirim pesan AI." : global.eror);
    }
}

handler.help = ['aitest <teks>'];
handler.tags = ['ai'];
handler.command = /^(aitest)$/i;

// Mengatur plugin agar bisa digunakan kapan saja tanpa limit (opsional, sesuaikan kebutuhan)
handler.limit = false;
handler.cooldown = 0; 

module.exports = handler;