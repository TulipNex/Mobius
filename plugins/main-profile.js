let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')
const { createCanvas, loadImage } = require('canvas') 

let handler = async (m, { conn, usedPrefix, command, text }) => {
  // 1. [FIX SILENT ERROR] - Penanganan Ekstraksi JID yang ketat
  let who = m.sender
  if (m.quoted) {
      who = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid[0]) {
      who = m.mentionedJid[0]
  } else if (text) {
      let parsed = text.replace(/[^0-9]/g, '')
      // Mencegah pembuatan JID '@s.whatsapp.net' kosong jika input hanya teks (misal: .profile bot)
      who = parsed.length > 5 ? parsed + '@s.whatsapp.net' : m.sender
  }

  let users = global.db.data.users
  if (!users[who]) users[who] = { exp: 0, limit: 10, lastclaim: 0, registered: false, name: '', age: -1, regTime: -1, premium: false, premiumTime: 0, level: 0, money: 0, role: 'Newbie ㋡', banned: false }

  let user = users[who]
  
  let { 
      name = '', 
      limit = 0, 
      exp = 0, 
      money = 0, 
      lastclaim = 0, 
      premiumTime = 0, 
      premium = false, 
      registered = false, 
      age = -1, 
      level = 0 
  } = user
  
  let username = registered ? name : await conn.getName(who) || 'User';

  let ppUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXIdvC1Q4WL7_zA6cJm3yileyBT2OsWhBb9Q&usqp=CAU'
  try { 
      ppUrl = await conn.profilePictureUrl(who, 'image') 
  } catch (e) {
      ppUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=512`;
  }

  // 2. TULIPNEX TRADER CALCULATION & BOARD
  let p = global.db.data.settings?.trading?.prices || {}
  let assetValue = (user.ivylink||0)*(p.IVL||3000) + (user.lilybit||0)*(p.LBT||100000) + (user.iriscode||0)*(p.IRC||1000000) + (user.lotusnet||0)*(p.LTN||10000000) + (user.rosex||0)*(p.RSX||100000000) + (user.tulipnex||0)*(p.TNX||1000000000)
  let networth = money + assetValue;

  // [FIX SILENT ERROR] - Meringankan komputasi Object.entries untuk mencegah Event Loop Blocking
  // Menggunakan iterasi yang sedikit lebih efisien untuk array yang sangat besar
  let allUsers = Object.values(users)
  let tnxHolders = allUsers.filter(u => (u.tulipnex || 0) > 0).sort((a, b) => (b.tulipnex || 0) - (a.tulipnex || 0));
  
  // Karena filter mengubah index, kita cari rank berdasarkan referensi objeknya
  let tnxRank = tnxHolders.findIndex(u => u === user);
  let tulipRole = '';

  if (tnxRank === 0) tulipRole = 'CEO TulipNex';
  else if (tnxRank === 1) tulipRole = 'Komisaris Utama';
  else if (tnxRank === 2) tulipRole = 'Direktur Eksekutif';
  else {
      if (networth >= 1000000000000) tulipRole = '🐋 Whale'; 
      else if (networth >= 100000000000) tulipRole = '🦈 Shark'; 
      else if (networth >= 10000000000) tulipRole = '🐬 Dolphin'; 
      else if (networth >= 1000000000) tulipRole = '🐢 Turtle'; 
      else if (networth >= 100000000) tulipRole = '🦀 Crab'; 
      else tulipRole = '🐟 Shrimp'; 
  }

  let bankDebt = user.bankLoan ? simplifyMoney(user.bankLoan.debt) : 'Nihil'

  // 3. XP LOGIC
  // [FIX SILENT ERROR] - Penanganan global.multiplier yang sering undefined
  let multiplier = typeof global.multiplier !== 'undefined' ? global.multiplier : 69 // Default multiplier 69
  let { min = 0, xp = 1, max = 0 } = levelling.xpRange(level, multiplier)
  
  let currentXpInLevel = Math.max(0, exp - min) 
  let remainingXp = Math.max(0, max - exp)
  let sn = createHash('md5').update(who).digest('hex').substring(0, 12)

  let str = `
*╭───[ 👤 PROFILE USER ]───*
*│* 🆔 *Nama:* ${username}
*│* 🏷️ *Tag:* @${who.split('@')[0]}
*│* 🎂 *Umur:* ${registered ? age + ' thn' : '-'}
*╰──────────────────*

*╭───[ ⚔️ RPG STATS ]───*
*│* 📊 *Level:* ${level}
*│* ✨ *Exp:* ${currentXpInLevel.toLocaleString('id-ID')} / ${xp.toLocaleString('id-ID')}
*│* 💎 *Limit:* ${limit.toLocaleString('id-ID')}
*╰──────────────────*

*╭───[ 📈 TRADER (CBE) ]───*
*│* 💵 *Tunai:* Rp ${simplifyMoney(money)}
*│* 💼 *Aset:* Rp ${simplifyMoney(assetValue)}
*│* 🏛️ *Networth:* Rp ${simplifyMoney(networth)}
*│* 🌟 *TulipNex:* ${tulipRole}
*│* 🏦 *Utang Bank:* ${bankDebt}
*╰──────────────────*

*╭───[ ⚙️ SYSTEM INFO ]───*
*│* 📌 *Daftar:* ${registered ? '✅' : '❌'}
*│* ⭐ *Premium:* ${premium ? '✅' : '❌'}
*│* ⏳ *Expired:* ${premium && premiumTime > 0 ? msToDate(premiumTime - Date.now()) : (premium ? 'Permanent' : '-')}
*│* 🔑 *S/N:* ${sn}...
*╰──────────────────*
`.trim()

  // 4. PEMBUATAN CANVAS MYUI 
  let finalImage;
  try {
      const width = 1080;
      const height = 640; 
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // [FIX SILENT ERROR] - Jangan memanggil fetch HTTP lain di dalam blok CATCH
      let bannerUrl = user?.profilebg; 
      if (bannerUrl) {
          try {
              let bannerImg = await loadImage(bannerUrl);
              ctx.drawImage(bannerImg, 0, 0, width, 480);
          } catch (err) {
              // Jika fetch gambar eksternal gagal, gambar background warna solid/gradien lokal
              ctx.fillStyle = '#2c3e50'; // Warna fallback modern
              ctx.fillRect(0, 0, width, 480);
          }
      } else {
          // Fallback lokal tanpa menggunakan API picsum.photos yang rentan timeout
          ctx.fillStyle = '#1e272e';
          ctx.fillRect(0, 0, width, 480);
      }
      
      let avatarImg = await loadImage(ppUrl);

      const avatarSize = 300;
      const avatarX = width / 2;
      const avatarY = 480;

      // Membuat "border transparan"
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, (avatarSize / 2) + 10, 0, Math.PI * 2, true);
      ctx.fill(); 
      ctx.restore();

      // Masking foto profil
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX - (avatarSize / 2), avatarY - (avatarSize / 2), avatarSize, avatarSize);
      ctx.restore();

      finalImage = canvas.toBuffer('image/png');
  } catch (e) {
      console.error("Canvas Profile Error:", e);
      finalImage = { url: ppUrl };
  }

  // Mengirimkan buffer image langsung atau fallback URL object
  await conn.sendMessage(m.chat, { image: finalImage, caption: str, mentions: [who] }, { quoted: m })
}

handler.help = ['profile', 'profil [@user]']
handler.tags = ['main']
handler.command = /^(profile?|profil)$/i

module.exports = handler

function simplifyMoney(num) {
  if (typeof num !== 'number' || isNaN(num)) num = 0;
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 10000000) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'Jt'
  
  return num.toLocaleString('id-ID')
}

function msToDate(ms) {
  if (!ms || ms < 0) return '-'
  let d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return `${d}hr ${h}j ${m}m`
}