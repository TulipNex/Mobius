// Jika AIRich berada di folder lib, uncomment baris di bawah ini dan sesuaikan path-nya
// const AIRich = require('../lib/AIRich');

// Fallback Implementasi Class AIRich jika tidak ada di environment global/lib Anda
class AIRich {
    constructor() {
        this.payload = { components: [] };
    }
    addText(text) {
        this.payload.components.push({ type: 'text', value: text });
        return this;
    }
    addTable(table) {
        this.payload.components.push({ type: 'table', value: table });
        return this;
    }
    addCode(lang, code) {
        this.payload.components.push({ type: 'code', language: lang, code: code });
        return this;
    }
    addReels(reels) {
        this.payload.components.push({ type: 'reels', items: reels });
        return this;
    }
    addSource(source) {
        this.payload.components.push({ type: 'source', sources: source });
        return this;
    }
    build(options = {}) {
        return {
            interactiveMessage: {
                ...options,
                content: this.payload
            }
        };
    }
}

let handler = async (m, { conn, text, usedPrefix, command, args, isOwner, isAdmin, isPrems }) => {
    try {
        // Mengirimkan pesan loading terlebih dahulu menggunakan global config
        m.reply(global.wait)

        // Inisialisasi dan build payload AIRich sesuai dengan snippet yang diberikan
        const Rich = new AIRich()
            .addText('TEXT INI') 
            .addText('=={ KUNING }==') 
            .addTable([["header1", "header2", "header3"], ["row1", "row2", "row3"]]) 
            .addCode('javascript', "// Fungsi sederhana untuk menghitung luas lingkaran\nfunction hitungLuasLingkaran(radius) {\n  if (radius <= 0) return 0;\n  return Math.PI * Math.pow(radius, 2);\n}\n\nconst r = 7;\nconsole.log(`Luas lingkaran dengan radius ${r} adalah: ${hitungLuasLingkaran(r).toFixed(2)}`);") 
        
        Rich.addReels(
            Array.from({ length: 10 }, () => ({
                title: "Nixel",
                profileIconUrl: "https://cdn.ornzora.eu.cc/09f3664f-ef75-4857-b309-bd2d1efc0412-FIORA.jpg",
                thumbnailUrl: "https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg",
                videoUrl: "https://www.instagram.com/reel/DSei363D_qw/",
                is_verified: true
            }))
        )
        .addSource([["https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg", "https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg", "TEXT"]]) 

        // Membangun hasil JSON
        let payloadBuild = Rich.build({ forwarded: true })
        let resultString = JSON.stringify(payloadBuild, null, 2)
        
        // Output 1: Mengirimkan hasil format String JSON ke chat
        await m.reply(resultString)

        /* =======================================================
        Output 2 (Opsional): 
        Jika `AIRich` menghasilkan custom Interactive Message Nodes Baileys, 
        Anda bisa mengirimkannya langsung ke relayMessage dengan menghapus 
        tanda komentar pada baris kode di bawah ini:
        =======================================================
        */
        // await conn.relayMessage(m.chat, payloadBuild, { messageId: m.key.id })

    } catch (error) {
        console.error(error)
        // Memunculkan pesan error global jika terjadi masalah
        m.reply(global.eror)
    }
}

// Konfigurasi UI dan Command
handler.help = ['asu']
handler.tags = ['tools', 'developer']
handler.command = /^(asu)$/i

// Flag keamanan dan akses
handler.limit = true // Mengurangi saldo limit / token saat dijalankan

module.exports = handler