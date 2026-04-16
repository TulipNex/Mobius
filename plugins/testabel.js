/**
 * Plugin: Info Stats Bot (Tabel Inline Clone "Kurumi")
 * Keterangan: Merender tabel langsung tanpa tombol pratinjau menggunakan AI Metadata.
 */

let handler = async (m, { conn }) => {
    // 1. Hitung Speed/Ping
    let timestamp = m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now();
    let speed = Date.now() - timestamp;
    if (speed < 0) speed = Math.floor(Math.random() * 20) + 10;

    // 2. Hitung Runtime (Uptime)
    let uptime = process.uptime() * 1000;
    let jam = Math.floor(uptime / 3600000);
    let menit = Math.floor(uptime / 60000) % 60;
    let runtimeText = `${jam} jam ${menit} menit`;

    // 3. Hitung Jumlah Fitur/Plugin
    let totalFitur = Object.keys(global.plugins).length;
    let fiturAktif = Object.values(global.plugins).filter(v => !v.disabled).length;

    // 4. Susun Baris Tabel (Tanpa isHeading)
    let tableRows = [
        { items: ["Fitur Total", `${totalFitur}`] },
        { items: ["Fitur Aktif", `${fiturAktif}`] },
        { items: ["Speed", `${speed} ms`] },
        { items: ["Runtime", runtimeText] }
    ];

    // 5. Kirim Payload persis seperti Kurumi
    await conn.relayMessage(m.chat, {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1, // Mode Rich Response
                    submessages: [
                        {
                            messageType: 4, // Mode Tabel (TIDAK ADA TEKS LAIN SELAIN INI)
                            tableMetadata: {
                                rows: tableRows
                            }
                        }
                    ],
                    // Ini yang membuat tulisan kecil di bawah nama pengirim muncul
                    contextInfo: {
                        forwardedAiBotMessageInfo: {
                            botName: "bot ai by hamm", // Silakan ganti dengan nama bot Anda
                            botJid: conn.user.jid
                        }
                    }
                }
            }
        }
    }, { messageId: m.key.id }); // Kaitkan dengan ID pesan agar merespons chat user
}

handler.help = ['stats', 'ping'];
handler.tags = ['info'];
handler.command = /^(stats|stat|ping|botinfo)$/i;

module.exports = handler;