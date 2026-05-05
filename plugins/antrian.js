const os = require('os');
const { performance } = require('perf_hooks');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Menghitung waktu respon (Ping)
    const start = performance.now();
    
    // Format memory dari bytes ke MB
    const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
    const mu = process.memoryUsage();
    
    // Format Uptime (Detik menjadi Hari, Jam, Menit, Detik)
    const runtime = (seconds) => {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m_time = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        var dDisplay = d > 0 ? d + " hari, " : "";
        var hDisplay = h > 0 ? h + " jam, " : "";
        var mDisplay = m_time > 0 ? m_time + " menit, " : "";
        var sDisplay = s > 0 ? s + " detik" : "";
        return dDisplay + hDisplay + mDisplay + sDisplay || "0 detik";
    };

    // Mengambil antrian dari antrian global (handler.msgqueque / conn.msgqueque)
    const msgQueue = conn.msgqueque ? conn.msgqueque.length : 0;
    
    // Total RAM OS
    const totalRAM = formatSize(os.totalmem() * 1024 * 1024);
    const freeRAM = formatSize(os.freemem() * 1024 * 1024);

    let txt = `*💻 SYSTEM PROCESS & QUEUE*\n\n`;
    
    txt += `*⚙️ System Info:*\n`;
    txt += `• OS: ${os.type()} ${os.release()}\n`;
    txt += `• Platform: ${os.platform()} (${os.arch()})\n`;
    txt += `• CPU Core: ${os.cpus().length} Cores\n`;
    txt += `• RAM Sisa: ${freeRAM} / ${totalRAM}\n`;
    txt += `• Node JS: ${process.version}\n`;
    txt += `• Server Uptime: ${runtime(os.uptime())}\n`;
    txt += `• Bot Uptime: ${runtime(process.uptime())}\n\n`;

    txt += `*📊 Memori V8 (Node.js):*\n`;
    txt += `• RSS: ${formatSize(mu.rss)} (Total Memori Dialokasikan)\n`;
    txt += `• Heap Total: ${formatSize(mu.heapTotal)}\n`;
    txt += `• Heap Used: ${formatSize(mu.heapUsed)} (Memori Dipakai)\n`;
    txt += `• External: ${formatSize(mu.external)}\n\n`;

    txt += `*🤖 Bot Status:*\n`;
    txt += `• Plugin Ter-load: ${Object.keys(global.plugins || {}).length} Fitur\n`;
    txt += `• Antrian Pesan: *${msgQueue}* pesan tertunda\n`;
    txt += `• Total User DB: ${Object.keys(global.db.data.users).length} Pengguna\n`;
    txt += `• Total Chat DB: ${Object.keys(global.db.data.chats).length} Obrolan\n\n`;

    const end = performance.now();
    txt += `*⚡ Kecepatan Respon:* ${(end - start).toFixed(2)} ms`;

    // Kirim hasil pemrosesan
    await m.reply(txt);
};

handler.help = ['process', 'ps', 'antrian', 'queue'];
handler.tags = ['owner'];
handler.command = /^(process|ps|queue|antrian)$/i;

// Mengatur tingkat keamanan (Security Flags)
handler.owner = true; // Hanya Owner yang bisa akses karena ini data konfidensial server
handler.limit = false; 

module.exports = handler;