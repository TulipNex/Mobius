const { createCanvas } = require('canvas');

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Kirim pesan loading
        await m.reply(global.wait);

        // Ukuran Canvas
        const width = 800;
        const height = 800;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Fungsi Helper untuk membuat Round Rectangle
        const drawRoundRect = (ctx, x, y, width, height, radius) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        };

        // 1. Gambar Background Abu-abu
        ctx.fillStyle = '#cfcfcf'; // Light grey background
        ctx.fillRect(0, 0, width, height);

        // Pengaturan Dimensi Window Editor
        const winX = 85;
        const winY = 200;
        const winW = 630;
        const winH = 400;
        const radius = 18;

        // 2. Gambar Base Window
        ctx.fillStyle = '#151718'; // Warna hitam keabu-abuan
        drawRoundRect(ctx, winX, winY, winW, winH, radius);
        ctx.fill();

        // 3. Top Bar (Header Window)
        ctx.fillStyle = '#1e1e1e';
        ctx.beginPath();
        ctx.moveTo(winX + radius, winY);
        ctx.lineTo(winX + winW - radius, winY);
        ctx.quadraticCurveTo(winX + winW, winY, winX + winW, winY + radius);
        ctx.lineTo(winX + winW, winY + 50);
        ctx.lineTo(winX, winY + 50);
        ctx.lineTo(winX, winY + radius);
        ctx.quadraticCurveTo(winX, winY, winX + radius, winY);
        ctx.closePath();
        ctx.fill();

        // 4. Tombol Mac OS (Merah, Kuning, Hijau)
        const btnY = winY + 25;
        ctx.fillStyle = '#FF5F56';
        ctx.beginPath(); ctx.arc(winX + 30, btnY, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFBD2E';
        ctx.beginPath(); ctx.arc(winX + 55, btnY, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27C93F';
        ctx.beginPath(); ctx.arc(winX + 80, btnY, 8, 0, Math.PI * 2); ctx.fill();

        // 5. Title Text (package.json)
        ctx.fillStyle = '#e5e5e5';
        ctx.font = '22px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('package.json', winX + winW / 2, btnY + 7);

        // Titik Tiga Kanan Atas
        ctx.textAlign = 'right';
        ctx.fillText('...', winX + winW - 20, btnY + 5);

        // 6. Toolbar Icons Line (Pembatas & Menu Teks)
        ctx.fillStyle = '#121212';
        ctx.fillRect(winX, winY + 50, winW, 40);
        
        ctx.fillStyle = '#d4d4d4';
        ctx.font = '16px "Courier New", Courier, monospace';
        ctx.textAlign = 'left';
        
        // ---> PERUBAHAN DI SINI: Mengganti emoji dengan teks menu bar standar <---
        ctx.fillText('File  Edit  Selection  View  Go  Run', winX + 20, winY + 75);
        
        ctx.textAlign = 'right';
        // ---> PERUBAHAN DI SINI: Mengganti simbol kotak yang rawan menjadi teks biasa <---
        ctx.fillText('[ ]  ...', winX + winW - 20, winY + 75);

        // 7. Gutter (Tempat Line Number)
        const codeStartY = winY + 90;
        ctx.fillStyle = '#0f1112';
        ctx.beginPath();
        ctx.moveTo(winX, codeStartY);
        ctx.lineTo(winX + 50, codeStartY);
        ctx.lineTo(winX + 50, winY + winH);
        ctx.lineTo(winX + radius, winY + winH);
        ctx.quadraticCurveTo(winX, winY + winH, winX, winY + winH - radius);
        ctx.closePath();
        ctx.fill();

        // 8. Line Numbers (1 sampai 7)
        ctx.font = '24px "Courier New", Courier, monospace';
        const lineHeight = 35;
        const firstLineY = codeStartY + 40;
        
        for (let i = 1; i <= 7; i++) {
            ctx.fillStyle = '#454545';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), winX + 25, firstLineY + ((i - 1) * lineHeight));
        }

        // 9. Render Baris Code JSON
        ctx.textAlign = 'left';
        const codeStartX = winX + 70;

        // Fungsi khusus untuk menulis text dengan beberapa warna dalam 1 baris
        const drawCodeLine = (lineIdx, textSegments) => {
            let currentX = codeStartX;
            const y = firstLineY + lineIdx * lineHeight;
            textSegments.forEach(seg => {
                ctx.fillStyle = seg.color;
                ctx.fillText(seg.text, currentX, y);
                currentX += ctx.measureText(seg.text).width;
            });
        };

        const keyColor = '#4ade80'; // Hijau Terang
        const valColor = '#22c55e'; // Hijau Sedikit Gelap
        const puncColor = '#e5e5e5'; // Putih Punctuation

        drawCodeLine(0, [{ text: '{', color: puncColor }]);
        
        drawCodeLine(1, [
            { text: '    "name" ', color: keyColor },
            { text: ': ', color: puncColor },
            { text: `"${global.botname} MD"`, color: valColor }
        ]);
        
        drawCodeLine(2, [
            { text: '    "version" ', color: keyColor },
            { text: ': ', color: puncColor },
            { text: '"1.0.0"', color: valColor }
        ]);
        
        drawCodeLine(3, [
            { text: '    "author" ', color: keyColor },
            { text: ': ', color: puncColor },
            { text: `"${global.author || global.nameowner}"`, color: valColor }
        ]);
        
        drawCodeLine(4, [
            { text: '    "base" ', color: keyColor },
            { text: ': ', color: puncColor },
            { text: '"rtxzy by BOTCAHX"', color: valColor }
        ]);
        
        drawCodeLine(5, [{ text: '}', color: puncColor }]);

        // Export gambar ke buffer
        const buffer = canvas.toBuffer('image/png');

        // Kirim hasil ke pengguna
        await conn.sendFile(m.chat, buffer, 'package.png', `*Bot Profile Generated!*\nMenampilkan informasi bot sesuai \`config.js\`.`, m);

    } catch (e) {
        console.error(e);
        m.reply(global.eror);
    }
};

handler.help = ['botprofile', 'profilbot'];
handler.tags = ['tools', 'maker'];
handler.command = /^(botprofile|profilbot|botinfo)$/i;

handler.limit = true; // Mengurangi limit pengguna jika ada

module.exports = handler;