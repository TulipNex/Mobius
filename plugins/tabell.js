/**
 * Plugin: Ultimate UI Showcase
 * Deskripsi: Menampilkan seluruh fitur UI dari MessageBuilder.js (AIRich, Native Flow Button, Video, Reels)
 * Role: Tools / Utility
 */

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // Validasi Input: Pastikan user memilih tipe UI yang ingin dilihat
    if (!args[0] || !['airich', 'button', 'video', 'reels'].includes(args[0].toLowerCase())) {
        let guide = `*PANDUAN PENGGUNAAN SHOWCASE*\n\n`;
        guide += `Silakan pilih tipe UI yang ingin ditampilkan:\n`;
        guide += `1. *${usedPrefix + command} airich* (Teks, Tabel, Code Snippet, Sources)\n`;
        guide += `2. *${usedPrefix + command} button* (Interactive Buttons, URL, Copy)\n`;
        guide += `3. *${usedPrefix + command} video* (Preview Video Header)\n`;
        guide += `4. *${usedPrefix + command} reels* (Carousel/Reels Video)\n\n`;
        guide += `Contoh: *${usedPrefix + command} reels*`;
        return m.reply(guide);
    }

    // Indikator Loading
    await m.reply(global.wait);

    // Import library MessageBuilder
    const { AIRich, Button } = require('../lib/MessageBuilder.js');
    const type = args[0].toLowerCase();

    try {
        if (type === 'airich') {
            // ==========================================
            // SHOWCASE 1: AIRICH (META AI STYLE UI)
            // ==========================================
            const tableData = [
                ["Rank", "Koin", "Harga", "Status"],
                ["#1", "Bitcoin (BTC)", "$65,000", "Bullish 📈"],
                ["#2", "Ethereum (ETH)", "$3,400", "Bullish 📈"],
                ["#3", "Solana (SOL)", "$300", "Bearish 📉"]
            ];

            const sources = [
                ["https://github.githubassets.com/favicon.ico", "https://github.com/nixel", "GitHub Profile"],
                ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png", "https://twitter.com", "Twitter / X"],
                ["https://google.com/favicon.ico", "https://google.com", "Google Search"]
            ];

            let richUI = new AIRich()
                .addText("✨ *SHOWCASE AIRICH MODULE* ✨\n\nIni adalah contoh implementasi teks Primitive biasa yang mendukung *Markdown*.")
                .addText("📊 *Contoh Fitur Tabel:*\nTabel di bawah ini memiliki fitur auto-normalisasi lebar kolom.")
                .addTable(tableData)
                .addText("💻 *Contoh Fitur Code Snippet:*\nBlok kode ini dilengkapi dengan *Syntax Highlighting* bawaan WhatsApp (berdasarkan Tokenizer).")
                .addCode("javascript", `// Contoh Scraper Sederhana\nconst axios = require('axios');\n\nasync function getIP() {\n  let res = await axios.get('https://api.ipify.org?format=json');\n  console.log("IP Anda:", res.data.ip);\n}\ngetIP();`)
                .addText("🔗 *Contoh Fitur Sources (Carousel Referensi):*\nAnda bisa menggeser menu di bawah ini ke kanan/kiri.")
                .addSource(sources);
            
            await richUI.run(m.chat, conn, m);

        } else if (type === 'button') {
            // ==========================================
            // SHOWCASE 2: NATIVE FLOW BUTTONS
            // ==========================================
            let thumbnailUrl = "https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg";

            let btnUI = new Button()
                .setImage(thumbnailUrl) 
                .setTitle("✨ SHOWCASE NATIVE FLOW BUTTON ✨")
                .setSubtitle("Interactive UI by MessageBuilder")
                .setBody("Ini adalah pesan interaktif v9. Anda dapat menambahkan berbagai macam tipe tombol di bawah ini.\n\nSilakan uji coba fungsionalitas tombol di bawah:")
                .setFooter(global.wm)
                .addReply("Balas Cepat 1", "id_balas_1")
                .addReply("Balas Cepat 2", "id_balas_2")
                .addCopy("📋 Salin Kode Promo", "NIXEL2024", "id_copy_1")
                .addUrl("🌐 Buka Website", "https://github.com/nixel")
                .addCall("📞 Hubungi Developer", "6282139672290")
                .addSelection("📂 Buka Menu Pilihan")
                .makeSections("Kategori Menu", "Populer")
                .makeRow("Header 1", "Pilihan Pertama", "Deskripsi untuk pilihan pertama", "id_pilih_1")
                .makeRow("Header 2", "Pilihan Kedua", "Deskripsi untuk pilihan kedua", "id_pilih_2");

            await btnUI.run(m.chat, conn, m);
            
        } else if (type === 'video') {
            // ==========================================
            // SHOWCASE 3: VIDEO HEADER BUTTON
            // ==========================================
            // Opsional: Ganti URL ini dengan URL file MP4 yang valid
            let videoUrl = "https://telegra.ph/file/a0134faad0b271d4400cb.mp4"; 

            let btnUI = new Button()
                .setVideo(videoUrl)
                .setTitle("🎥 SHOWCASE PREVIEW VIDEO")
                .setSubtitle("Header Video Native Flow")
                .setBody("Video di atas adalah contoh penggunaan media header video menggunakan MessageBuilder. Silakan tekan tombol play untuk memutarnya langsung di chat!")
                .setFooter(global.wm)
                .addUrl("Tonton di YouTube", "https://youtube.com");

            await btnUI.run(m.chat, conn, m);

        } else if (type === 'reels') {
            // ==========================================
            // SHOWCASE 4: VIDEO CAROUSEL / REELS
            // ==========================================
            let richUI = new AIRich()
                .addText("✨ *SHOWCASE REELS CAROUSEL* ✨\nGeser ke samping untuk melihat video lainnya.");
            
            // Validasi: Mengecek apakah metode addReels sudah Anda pasang di MessageBuilder.js
            if (typeof richUI.addReels === 'function') {
                richUI.addReels([
                    {
                        title: "Cuplikan Video 1",
                        profileIconUrl: "https://github.githubassets.com/favicon.ico",
                        thumbnailUrl: "https://cdn.ornzora.eu.cc/8b2be802-fb4f-431a-9df5-a633c3057c67-FIORA.jpg",
                        videoUrl: "https://www.instagram.com/reel/DSei363D_qw/",
                        is_verified: true
                    },
                    {
                        title: "Cuplikan Video 2",
                        profileIconUrl: "https://google.com/favicon.ico",
                        thumbnailUrl: "https://cdn.ornzora.eu.cc/09f3664f-ef75-4857-b309-bd2d1efc0412-FIORA.jpg",
                        videoUrl: "https://www.instagram.com/reel/DSei363D_qw/",
                        is_verified: false
                    }
                ]);
                await richUI.run(m.chat, conn, m);
            } else {
                // Fallback jika belum menambahkan modifikasi
                return m.reply("⚠️ *Fungsi belum tersedia!*\n\nAnda belum menambahkan fungsi `addReels()` ke dalam file `/lib/MessageBuilder.js`. Silakan ikuti 'Langkah 1' pada *Panduan_Video.md* terlebih dahulu.");
            }
        }

    } catch (e) {
        console.error(`[Error Showcase ${type.toUpperCase()}]`, e);
        await m.reply(global.eror + `\n\n*Log:* ${e.message}`);
    }
};

handler.help = ['showcase <tipe>'];
handler.tags = ['tools'];
handler.command = /^(showcase|testui)$/i;

// Flag Keamanan & Aksesibilitas
handler.limit = true; 

module.exports = handler;