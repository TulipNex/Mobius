// Simpan di folder plugins, misal: plugins/tes-tombol.js

let handler = async (m, { conn, usedPrefix }) => {
    let text = `Halo, silakan pilih menu di bawah ini:`
    
    // Ini contoh struktur pengiriman pesan tombol (Interactive Message) 
    // Format bisa berbeda tergantung versi Baileys yang kamu gunakan, tapi intinya ada pada 'id'
    let msg = {
        text: text,
        footer: global.wm,
        buttons: [
            {
                buttonId: `${usedPrefix}ping`, // <--- INI KUNCINYA. main-buttonrespon.js akan membaca ini!
                buttonText: {
                    displayText: 'Cek Kecepatan Bot'
                },
                type: 1
            },
            {
                buttonId: `${usedPrefix}owner`, // <--- Akan mengeksekusi perintah .owner
                buttonText: {
                    displayText: 'Hubungi Owner'
                },
                type: 1
            }
        ],
        headerType: 1
    }

    // Mengirim pesan
    await conn.sendMessage(m.chat, msg, { quoted: m })
}

handler.help = ['testombol']
handler.tags = ['main']
handler.command = /^(testombol)$/i

module.exports = handler