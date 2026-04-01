const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Masukkan judul lagu yang ingin dicari liriknya!\n\n*Contoh:* ${usedPrefix + command} fuji kaze shinunoga e-wa`);
  }

  try {
    // Mengirim pesan loading
    m.reply(global.wait);

    // Endpoint API resmi LRCLIB
    let apiUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(text)}`;
    let res = await axios.get(apiUrl);
    let data = res.data;

    // Cek apakah data ditemukan
    if (!data || data.length === 0) {
      return m.reply('❌ Lirik tidak ditemukan untuk pencarian tersebut.');
    }

    // Mengambil hasil pencarian pertama (paling relevan)
    let song = data[0]; 
    let title = song.trackName || 'Tidak diketahui';
    let artist = song.artistName || 'Tidak diketahui';
    let album = song.albumName || 'Tidak diketahui';
    
    // Mengutamakan lirik tersinkronisasi (LRC), jika tidak ada gunakan lirik biasa
    let lyricsText = song.syncedLyrics || song.plainLyrics;

    if (lyricsText) {
      let caption = `🎵 *Lirik Ditemukan!*\n\n*Judul:* ${title}\n*Artis:* ${artist}\n*Album:* ${album}\n\n*Lirik:*\n${lyricsText}`;
      
      // Mengirimkan lirik sebagai pesan teks
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    } else {
      // Jika lagu ada di database tapi lirik kosong
      m.reply(`❌ Lagu *${title}* oleh *${artist}* ditemukan di database, tetapi liriknya belum tersedia.`);
    }

  } catch (e) {
    console.error(e);
    // Menggunakan pesan error standar dari global
    m.reply(global.eror);
  }
}

handler.help = ['lrc <judul>'];
handler.tags = ['tools'];
handler.command = /^(lrc|lrclib|lyrics)$/i;

module.exports = handler;