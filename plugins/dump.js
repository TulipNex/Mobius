let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(
            `⚠️ *Format Salah!*\n\n` +
            `*Cara 1: Tabel Cepat*\n` +
            `${usedPrefix + command} header1 | header2 | header3\nbaris1a | baris1b | baris1c\nbaris2a | baris2b | baris2c\n\n` +
            `*Cara 2: Tabel Keuangan*\n` +
            `${usedPrefix + command} keuangan\nBiskuit | 2 | 23000\nLangsat | 1 | 34000\n\n` +
            `*Cara 3: Tabel Jadwal*\n` +
            `${usedPrefix + command} jadwal\n08:00 | Rapat\n10:00 | Coding\n\n` +
            `*Catatan:* Pisahkan kolom pakai tanda |`
        )
    }

    let lines = text.split('\n').filter(v => v.trim())
    
    // MODE KEUANGAN OTOMATIS HITUNG TOTAL
    if (lines[0].toLowerCase() === 'keuangan') {
        lines.shift() // hapus baris 'keuangan'
        if (lines.length === 0) return m.reply('⚠️ Masukkan data keuangannya!')
        
        let rows = lines.map(line => line.split('|').map(v => v.trim()))
        
        let total = 0
        // [PERBAIKAN] Garis pembatas (---) disesuaikan agar pas 5 kolom
        let table = `| No | Nama Barang | Qty | Harga | Subtotal |\n|---|---|---|---|---|\n`
        
        rows.forEach((row, i) => {
            // Berikan default value '-' atau '0' jika kolom tidak diisi
            let [nama = '-', qtyStr = '0', hargaStr = '0'] = row
            
            // [PERBAIKAN] Bersihkan string dari huruf dan titik (misal "Rp 23.000" jadi "23000") sebelum dikali
            let qty = parseInt(qtyStr.replace(/[^0-9-]/g, '')) || 0
            let harga = parseInt(hargaStr.replace(/[^0-9-]/g, '')) || 0
            
            let subtotal = qty * harga
            total += subtotal
            table += `| ${i + 1} | ${nama} | ${qty} | ${harga.toLocaleString('id-ID')} | ${subtotal.toLocaleString('id-ID')} |\n`
        })
        
        table += `| | | | **Total** | **${total.toLocaleString('id-ID')}** |`
        return m.reply(table)
    }

    // MODE JADWAL
    if (lines[0].toLowerCase() === 'jadwal') {
        lines.shift()
        if (lines.length === 0) return m.reply('⚠️ Masukkan data jadwalnya!')
        
        let table = `| Jam | Kegiatan |\n|---|---|\n`
        lines.forEach(line => {
            let [jam, kegiatan] = line.split('|').map(v => v.trim())
            table += `| ${jam || '-'} | ${kegiatan || '-'} |\n`
        })
        return m.reply(table)
    }

    // MODE CUSTOM: Baris pertama = header
    if (lines.length < 2) return m.reply('⚠️ Minimal 2 baris: 1 header + 1 data')
    
    let header = lines[0].split('|').map(v => v.trim())
    let dataRows = lines.slice(1).map(line => line.split('|').map(v => v.trim()))
    
    // Bikin header
    let table = `| ${header.join(' | ')} |\n`
    table += `| ${header.map(() => '---').join(' | ')} |\n`
    
    // Bikin isi
    dataRows.forEach(row => {
        // Samain jumlah kolom dengan header biar rapi (tidak error markdownnya)
        while (row.length < header.length) row.push('-')
        table += `| ${row.slice(0, header.length).join(' | ')} |\n`
    })
    
    m.reply(table.trim())
}

handler.help = ['maketable <data>']
handler.tags = ['tools']
handler.command = /^(maketable|buattabel|tabel)$/i

module.exports = handler