/**
 * Plugin: Spotify Search & Downloader (Interactive Buttons)
 * Description: Mencari dan mengunduh lagu dari Spotify terintegrasi Native Flow
 * Author: Senior Bot Developer
 */

const spotify = require('../lib/spotify');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input Dasar
    if (!text) {
        let txt = `*Contoh Penggunaan:*\n`;
        txt += `⭔ *Pencarian:* ${usedPrefix}${command} about you\n`;
        txt += `⭔ *Download:* ${usedPrefix}${command} https://open.spotify.com/track/3hEfpBHxgieRLz4t3kLNEg`;
        return m.reply(txt);
    }

    // 2. Memberikan response feedback agar user tahu request diproses
    await m.reply(global.wait || '⏳ _Sedang memproses..._');

    // ==========================================
    // HELPER: Bypass ESM Error & Native Flow Setup
    // ==========================================
    const { 
       proto,
       prepareWAMessageMedia,
       generateWAMessageFromContent
    } = await import('@adiwajshing/baileys');

    const sendButton = async (jid, buttons = [], quoted = null, opts = {}) => {
        if (!conn.user?.id) throw new Error("User not authenticated");
        if (!Array.isArray(buttons) || !buttons.length) throw new Error("Buttons must be a non-empty array");

        const { title = "", subtitle = "", header = "", content = "", footer = "", image = null } = opts;

        const processedButtons = buttons.map((btn, i) => {
            if (!btn.name || !btn.buttonParamsJson) throw new Error(`Button[${i}] invalid format`);
            return {
                name: btn.name,
                buttonParamsJson: btn.buttonParamsJson
            };
        });

        let headerContent;
        if (image) {
            const media = typeof image === "string" ? { image: { url: image } } : { image };
            const prepared = await prepareWAMessageMedia(media, { upload: conn.waUploadToServer });
            headerContent = {
                title: title || undefined,
                subtitle: subtitle || undefined,
                hasMediaAttachment: true,
                imageMessage: prepared.imageMessage
            };
        } else if (header || title) {
            headerContent = {
                title: title || header,
                subtitle: subtitle || undefined,
                hasMediaAttachment: false
            };
        }

        const interactive = proto.Message.InteractiveMessage.create({
            ...(headerContent && { header: headerContent }),
            ...(content && { body: { text: content } }),
            ...(footer && { footer: { text: footer } }),
            contextInfo: {
                mentionedJid: conn.parseMention ? conn.parseMention(content) : []
            },
            nativeFlowMessage: {
                buttons: processedButtons
            }
        });

        const msg = generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: interactive
                }
            }
        }, { userJid: conn.user.id, quoted });

        await conn.relayMessage(jid, msg.message, {
            messageId: msg.key.id,
            additionalNodes: [{
                tag: "biz",
                attrs: {},
                content: [{
                    tag: "interactive",
                    attrs: { type: "native_flow", v: "1" },
                    content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }]
                }]
            }]
        });
        return msg;
    };

    try {
        // 3. Deteksi Input: Apakah berupa Link Download atau Query Pencarian?
        const isUrl = text.match(/spotify\.com/i);

        if (isUrl) {
            // ==========================================
            // MODE DOWNLOADER
            // ==========================================
            const res = await spotify.download(text);

            if (!res.status) throw res.msg || `Gagal mengambil data dari Spotify.`;

            // Ekstraksi Data dari module library
            let { title, artist, album, cover, releaseDate } = res.metadata;
            let audioUrl = res.download.mp3;

            // Merakit Caption (Mempertahankan UX UX lama)
            let caption = `🎵 *S P O T I F Y - D L*\n\n`;
            caption += `🎧 *Judul:* ${title}\n`;
            caption += `🎤 *Artis:* ${artist}\n`;
            caption += `💿 *Album:* ${album}\n`;
            caption += `📅 *Rilis:* ${releaseDate}\n\n`;
            caption += `_Tunggu sebentar, file audio sedang dikirim..._`;

            // Kirim Cover Image dengan Caption
            await conn.sendFile(m.chat, cover, 'cover.jpg', caption, m);

            // Kirim File Audio (MP3)
            await conn.sendMessage(m.chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3`,
                ptt: false // Set true jika ingin berbentuk Voice Note
            }, { quoted: m });

        } else {
            // ==========================================
            // MODE SEARCH DENGAN BUTTON INTERAKTIF
            // ==========================================
            const res = await spotify.search(text);
            
            if (!res.status) throw `❌ Lagu *${text}* tidak ditemukan di Spotify.`;

            const tracks = res.data;
            
            // Menghapus list teks polos, menyisakan instruksi untuk klik button
            let txt = `🎧 *S P O T I F Y  S E A R C H*\n\n`;
            txt += `Hasil pencarian untuk: *${text}*\n\n`;
            txt += `> _Silahkan ketuk tombol "PILIH LAGU" di bawah untuk melihat daftar dan mengunduh lagu._`;
            
            let limit = Math.min(10, tracks.length); 
            let buttonRows = [];
            
            // Gunakan fallback prefix aman agar tombol pasti bisa tereksekusi
            let prefix = usedPrefix || '.'; 

            // Looping dan format hasil langsung ke dalam button
            for (let i = 0; i < limit; i++) {
                let track = tracks[i];
                let title = track.title || track.name || 'Unknown Title';
                let artist = track.artist || track.artists || track.author || 'Unknown Artist';
                let duration = track.duration || track.timestamp || '-';
                
                // Pengecekan URL ekstra ketat
                let url = track.url || track.link || (track.external_urls && track.external_urls.spotify) || (track.id ? `https://open.spotify.com/track/${track.id}` : '');
                
                if (!url.match(/spotify\.com/i)) continue;

                // Push data hasil pencarian ke baris list button
                buttonRows.push({
                    title: title.length > 50 ? title.substring(0, 47) + '...' : title, // Mencegah crash jika judul kepanjangan
                    description: `Artis: ${artist} | Durasi: ${duration}`.substring(0, 70), // Maksimal batas aman WA (72 karakter)
                    id: `${prefix}spotify ${url}` // Memanfaatkan prefix valid
                });
            }

            if (buttonRows.length === 0) throw `❌ Tidak ada hasil lagu dengan URL valid.`;

            // Ambil thumbnail dari hasil pertama jika tersedia
            let thumb = tracks[0].image || tracks[0].thumbnail || tracks[0].cover || 'https://telegra.ph/file/70e8de9b1879568954f09.jpg';

            // Merakit Tombol Native Flow
            const buttons = [
                {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: "🎧 PILIH LAGU",
                        sections: [{
                            title: `Hasil Pencarian: ${text}`,
                            highlight_label: "Teratas",
                            rows: buttonRows
                        }]
                    })
                }
            ];

            // Kirim via Helper sendButton
            await sendButton(m.chat, buttons, m, {
                content: txt.trim(),
                footer: global.wm || '© Spotify Downloader',
                image: thumb
            });
        }

    } catch (e) {
        console.error('[Plugin Spotify Error]', e);
        // Fallback error menggunakan format error global
        m.reply(typeof e === 'string' ? e : (global.eror || '❌ Terjadi kesalahan pada server kami.'));
    }
}

// Metadata Plugin standar Baileys Bot
handler.help = ['spotify'].map(v => v + ' <judul lagu/link>');
handler.tags = ['downloader'];
handler.command = /^(spotify(dl|search)?)$/i;

// Flag Keamanan & Batasan Penggunaan
handler.limit = true; // Mengurangi limit bot pengguna
handler.group = false; // Boleh digunakan di PC maupun Grup

// ==========================================
// INTERCEPTOR: Pembaca Respon Native Flow
// ==========================================
handler.all = async function (m) {
    // Tangkap respon tersembunyi dari klik Native Flow Button
    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
        try {
            let params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            // Jika ID dari tombol mengandung kata 'spotify', paksa jadikan itu sebagai teks pesan
            if (params?.id && params.id.includes('spotify')) {
                m.text = params.id; 
            }
        } catch (e) {
            console.error("Gagal membaca respon tombol:", e);
        }
    }
};

module.exports = handler;