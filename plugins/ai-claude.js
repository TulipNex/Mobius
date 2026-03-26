const fs = require('fs')
const path = require('path')
const claude = require('../lib/claude')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Ambil data user dari database untuk sistem memori
    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') global.db.data.users[m.sender] = {}

    // 2. Fitur Reset Memori
    if (text === 'reset') {
        user.claudeConvId = null
        return m.reply(`✅ *Sesi Claude Direset!*\n\nIngatan percakapan sebelumnya telah dihapus. Claude siap untuk memulai topik baru.`)
    }

    // 3. Validasi Input
    if (!text) {
        return m.reply(`Masukkan pertanyaan atau prompt yang ingin ditanyakan ke Claude!\n\n*Contoh Text:* \n${usedPrefix + command} Apa itu AI?\n\n*Contoh Gambar (Reply Gambar):*\n${usedPrefix + command} Jelaskan apa yang ada di gambar ini!\n\n*Reset Ingatan (Hapus Memori):*\n${usedPrefix + command} --reset`)
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    let imagePaths = []
    let tmpPath = ''

    m.reply(global.wait)

    try {
        // 4. Jika input disertai gambar, download dan simpan ke /tmp/
        if (/image/.test(mime)) {
            let media = await q.download()
            let ext = mime.split('/')[1] || 'jpg'
            tmpPath = path.join(process.cwd(), 'tmp', `claude_${Date.now()}.${ext}`)
            fs.writeFileSync(tmpPath, media)
            imagePaths.push(tmpPath)
        }

        // 5. Eksekusi Scraper Claude AI (Kirim text, gambar, dan ID memori user)
        let existingConvId = user.claudeConvId || null
        let result = await claude(text, imagePaths, existingConvId)

        let replyText = ""

        // 6. Safety Check: Mencegah respon kosong akibat cache scraper lama
        if (typeof result === 'object' && result !== null) {
            replyText = result.reply
            user.claudeConvId = result.convId // Simpan sesi ke database user
        } else if (typeof result === 'string') {
            replyText = result // Fallback: tangkap teks jika masih pakai scraper lama
        }

        if (!replyText) throw 'Respon Claude kosong.'

        // --- FORMATTING TEKS UNTUK WHATSAPP ---
        // Mengubah bintang ganda (**) menjadi bintang tunggal (*) agar tebal di WhatsApp
        replyText = replyText.replace(/\*\*/g, '*')
        // Menghilangkan simbol ### (Markdown Heading)
        replyText = replyText.replace(/###/g, '')

        // 7. Kirim balasan Claude ke pengguna
        m.reply(replyText.trim())

    } catch (e) {
        console.error("Claude Error:", e)
        m.reply(typeof e === 'string' ? `*Gagal:* ${e}` : global.eror)
    } finally {
        // 8. CLEANUP: Hapus file gambar sementara
        if (tmpPath && fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath)
        }
    }
}

// Metadata Plugin
handler.help = ['claude <prompt>', 'claude reset']
handler.tags = ['ai']
handler.command = /^(claude)$/i

// Pembatasan fitur
handler.limit = true 
handler.premium = false 

module.exports = handler