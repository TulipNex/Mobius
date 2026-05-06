let levelling = require('../lib/levelling')

let handler = m => {
  let user = global.db.data.users[m.sender]
  let multiplier = global.multiplier || 36

  // Cek apakah exp mencukupi untuk naik level
  let canLevelUp = levelling.canLevelUp(user.level, user.exp, multiplier)

  if (!canLevelUp) {
    let { min, xp, max } = levelling.xpRange(user.level, multiplier)
    let msg = `
Level *${user.level} (${user.exp - min}/${xp})*
Kurang *${max - user.exp}* XP lagi!
`.trim()
    
    // Beri info jika autolevelup menyala
    if (user.autolevelup) {
       msg += '\n\n(Status: Auto-Levelup Aktif. Level akan naik otomatis jika XP penuh)'
    }
    return m.reply(msg)
  }

  // Jika exp ternyata mencukupi (bisa saja auto-levelup terlewat saat restart bot)
  let before = user.level * 1
  let targetLevel = levelling.findLevel(user.exp, multiplier)
  
  if (targetLevel > user.level) {
      user.level = targetLevel
      
      let msg = `
Selamat, anda telah naik level!
*${before}* ➔ *${user.level}*
Gunakan *.profile* untuk mengecek status barumu.
`.trim()

      if (user.autolevelup) {
          msg += '\n\n_(ℹ️ Status: Auto-Levelup Aktif)_'
      }
      m.reply(msg)
  }
}

handler.help = ['level']
handler.tags = ['xp']
handler.command = /^(level|levelup)$/i

module.exports = handler