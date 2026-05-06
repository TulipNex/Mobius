const moment = require('moment-timezone')
const PhoneNum = require('awesome-phonenumber')

let regionNames = new Intl.DisplayNames(['en'], {
    type: 'region'
})

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command: cmd
}) => {
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null))
    if (!who) throw `Ex: ${usedPrefix + cmd} @tag / 628xxx`

    // 1. Resolve PN (Phone Number)
    let pn = who;
    if (typeof conn.getJid === 'function') {
        pn = await conn.getJid(who) || who;
    }
    if (!pn.includes('@')) pn += '@s.whatsapp.net'

    // 2. Resolve LID (Linked Device) untuk Bypass PP
    let lid = 'Tidak diketahui';
    if (who.endsWith('@lid')) {
        lid = who;
    } else {
        if (m.isGroup) {
            try {
                let groupMetadata = await conn.groupMetadata(m.chat);
                let participant = groupMetadata.participants.find(p => p.id === who);
                if (participant && participant.lid) {
                    lid = participant.lid;
                }
            } catch (e) {}
        }
        if (lid === 'Tidak diketahui' && conn.isLid) {
            let keys = conn.isLid.keys();
            for (let key of keys) {
                if (conn.isLid.get(key) === pn) {
                    lid = key;
                    break;
                }
            }
        }
    }

    if (!(await conn.onWhatsApp(pn))[0]?.exists) throw 'User not exists'

    let img = 'https://telegra.ph/file/70e8de9b1879568954f09.jpg'
    try {
        // Coba fetch PP via LID terlebih dahulu (Bypass privasi PP WA terbaru)
        img = await conn.profilePictureUrl(lid !== 'Tidak diketahui' ? lid : pn, 'image')
    } catch (e) {
        try {
            // Fallback fetch via PN normal
            img = await conn.profilePictureUrl(pn, 'image')
        } catch (e) {}
    }

    let bio = await conn.fetchStatus(pn).catch(_ => {})
    let name = await conn.getName(pn)
    let business = await conn.getBusinessProfile(pn).catch(_ => null)
    let format = PhoneNum(`+${pn.split('@')[0]}`)
    let country = 'Unknown'
    try {
        country = regionNames.of(format.getRegionCode('international'))
    } catch (e) {}

    let res = `\t\t\t\t*▾ WHATSAPP ▾*\n
*° Country :* ${country.toUpperCase()}
*° Name :* ${name ? name : '-'}
*° Format Number :* ${format.getNumber('international')}
*° LID :* ${lid !== 'Tidak diketahui' ? lid.split('@')[0] : '-'}
*° Url Api :* wa.me/${pn.split('@')[0]}
*° Mentions :* @${pn.split('@')[0]}
*° Status :* ${bio?.status || '-'}
*° Date Status :* ${bio?.setAt ? moment(bio.setAt.toDateString()).locale('id').format('LL') : '-'}\n
${business ? `\t\t\t\t*▾ INFO BUSINESS ▾*\n
*° BusinessId :* ${business.wid}
*° Website :* ${business.website ? business.website : '-'}
*° Email :* ${business.email ? business.email : '-'}
*° Category :* ${business.category}
*° Address :* ${business.address ? business.address : '-'}
*° Timezone :* ${business.business_hours?.timezone ? business.business_hours.timezone : '-'}
*° Description* : ${business.description ? business.description : '-'}` : '*Standard WhatsApp Account*'}`.trim()

    await conn.sendMessage(m.chat, {
        image: {
            url: img
        },
        caption: res,
        mentions: [pn]
    }, {
        quoted: m
    })
}

handler.help = ['wastalk']
handler.tags = ['tools']
handler.command = /^(wa|whatsapp)stalk$/i
handler.limit = true

module.exports = handler