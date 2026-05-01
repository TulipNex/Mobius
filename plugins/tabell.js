/**
 * Plugin: Ultimate UI Showcase
 * Deskripsi: Menampilkan seluruh fitur UI dari MessageBuilder.js (AIRich & Native Flow Button)
 * Role: Tools / Utility
 */

const axios = require('axios'); // Pastikan axios terinstall (npm i axios)

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // Validasi Input: Pastikan user memilih tipe UI yang ingin dilihat
    if (!args[0] || !['airich', 'button'].includes(args[0].toLowerCase())) {
        return m.reply(`*PANDUAN PENGGUNAAN SHOWCASE*\n\nSilakan pilih tipe UI yang ingin ditampilkan:\n1. *${usedPrefix + command} airich* (Teks, Tabel, Code Snippet, Sources)\n2. *${usedPrefix + command} button* (Interactive Buttons, URL, Copy)\n\nContoh: *${usedPrefix + command} airich*`);
    }

    // Indikator Loading
    await m.reply(global.wait);

    // Import library MessageBuilder yang sudah kita refactor ke CommonJS
    const { AIRich, Button } = require('../lib/MessageBuilder.js');
    const type = args[0].toLowerCase();

    try {
        if (type === 'airich') {
            // ==========================================
            // SHOWCASE 1: AIRICH (META AI STYLE UI)
            // ==========================================
            
            // Simulasi: Membuat data tabel hasil dari "Scraping/API"
            const tableData = [
                ["Rank", "Koin", "Harga", "Status"],
                ["#1", "Bitcoin (BTC)", "$65,000", "Bullish 📈"],
                ["#2", "Ethereum (ETH)", "$3,400", "Bullish 📈"],
                ["#3", "Solana (SOL)", "$300", "Bearish 📉"]
            ];

            // Simulasi: Source Carousel
            const sources = [
                ["https://github.githubassets.com/favicon.ico", "https://github.com/nixel", "GitHub Profile"],
                ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png", "https://twitter.com", "Twitter / X"],
                ["https://google.com/favicon.ico", "https://google.com", "Google Search"]
            ];

            // Eksekusi Rantai AIRich
            let richUI = new AIRich()
                .addText("✨ *SHOWCASE AIRICH MODULE* ✨\n\nIni adalah contoh implementasi teks Primitive biasa yang mendukung *Markdown*.")
                .addText("📊 *Contoh Fitur Tabel:*\nTabel di bawah ini memiliki fitur auto-normalisasi lebar kolom.")
                .addTable(tableData)
                .addText("💻 *Contoh Fitur Code Snippet:*\nBlok kode ini dilengkapi dengan *Syntax Highlighting* bawaan WhatsApp (berdasarkan Tokenizer).")
                .addCode("javascript", `// Contoh Scraper Sederhana\nconst axios = require('axios');\n\nasync function getIP() {\n  let res = await axios.get('https://api.ipify.org?format=json');\n  console.log("IP Anda:", res.data.ip);\n}\ngetIP();`)
                .addText("🔗 *Contoh Fitur Sources (Carousel Referensi):*\nAnda bisa menggeser menu di bawah ini ke kanan/kiri.");
            
            // Tambahkan sources di akhir
            richUI.addSource(sources);

            // Jika Anda sudah menambahkan addReels() di MessageBuilder Anda secara manual, hapus komen di bawah:
            /*
            if (typeof richUI.addReels === 'function') {
                richUI.addReels([{
                    title: "Nixel Video",
                    profileIconUrl: "https://github.githubassets.com/favicon.ico",
                    thumbnailUrl: "https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg",
                    videoUrl: "https://www.instagram.com/",
                    is_verified: true
                }]);
            }
            */

            // Kirim Payload
            await richUI.run(m.chat, conn, m);

        } else if (type === 'button') {
            // ==========================================
            // SHOWCASE 2: NATIVE FLOW BUTTONS
            // ==========================================
            
            // Siapkan header image (opsional, ganti URL dengan gambar yang valid)
            let thumbnailUrl = "https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg";

            let btnUI = new Button()
                .setImage(thumbnailUrl) // Bisa diganti .setVideo() atau .setDocument()
                .setTitle("✨ SHOWCASE NATIVE FLOW BUTTON ✨")
                .setSubtitle("Interactive UI by MessageBuilder")
                .setBody("Ini adalah pesan interaktif v9. Anda dapat menambahkan berbagai macam tipe tombol di bawah ini.\n\nSilakan uji coba fungsionalitas tombol di bawah:")
                .setFooter(global.wm) // Menggunakan watermark dari config
                
                // Menambahkan Tombol Balasan Biasa
                .addReply("Balas Cepat 1", "id_balas_1")
                .addReply("Balas Cepat 2", "id_balas_2")
                
                // Menambahkan Tombol Aksi Copy
                .addCopy("📋 Salin Kode Promo", "NIXEL2024", "id_copy_1")
                
                // Menambahkan Tombol URL
                .addUrl("🌐 Buka Website", "https://github.com/nixel")
                
                // Menambahkan Tombol Telepon
                .addCall("📞 Hubungi Developer", "6282139672290")

                // (Opsional) Membuat Menu Dropdown / Sections
                .addSelection("📂 Buka Menu Pilihan")
                .makeSections("Kategori Menu", "Populer")
                .makeRow("Header 1", "Pilihan Pertama", "Deskripsi untuk pilihan pertama", "id_pilih_1")
                .makeRow("Header 2", "Pilihan Kedua", "Deskripsi untuk pilihan kedua", "id_pilih_2");

            // Kirim Payload Native Flow
            await btnUI.run(m.chat, conn, m);
        }

    } catch (e) {
        console.error(`[Error Showcase ${type.toUpperCase()}]`, e);
        // Fallback error global
        await m.reply(global.eror + `\n\n*Log:* ${e.message}`);
    }
};

handler.help = ['showcase <tipe>'];
handler.tags = ['tools'];
handler.command = /^(showcase|testui)$/i;

// Flag Keamanan & Aksesibilitas
handler.limit = true; // Mengurangi limit pengguna
// handler.owner = true; // Uncomment baris ini jika hanya Owner yang boleh mengetesnya

module.exports = handler;