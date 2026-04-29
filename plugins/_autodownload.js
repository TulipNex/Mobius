const fetch = require('node-fetch');
const axios = require('axios');

// Mendefinisikan variabel API key fallback dari global jika ada, untuk fungsi yang belum dimodifikasi scraper-nya
const btc = global.btc || 'apikey'; 

let handler = (m) => m;
handler.before = async function (m, { conn, isPrems }) {
    let chat = global.db.data.chats[m.chat];
    if (!m.text) return;
    
    // Jangan proses jika pesan berawalan prefix (karena itu untuk command manual)
    if (m.text.startsWith("=>") || m.text.startsWith(">") || m.text.startsWith(".") || m.text.startsWith("#") || m.text.startsWith("!") || m.text.startsWith("/") || m.text.startsWith("\\")) return;
    
    if (chat.isBanned) return;
    if (!m.text.includes("http")) return;
    
    let text = m.text.replace(/\n+/g, " ");
    
    // Kumpulan Regex Downloader
    const tiktokRegex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/i;
    const douyinRegex = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.|v\.)?(?:douyin\.com\/)(?:\S+)?$/i;
    const instagramRegex = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/i;
    const facebookRegex = /^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/i;
    const pinRegex = /^(?:https?:\/\/)?(?:www\.|id\.)?(?:pinterest\.(?:com|it|co\.[a-z]{2}|[a-z]{2})|pin\.it)\/(?:pin\/)?[^\/\s]+(?:\/)?$/i;
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)(?:\S+)?$/i;
    const spotifyRegex = /^(?:https?:\/\/)?(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]+)(?:\S+)?$/i;
    const twitterRegex = /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status\/(\d+)(?:\?[^#]*)?(?:#.*)?$/i;
    const threadsRegex = /^(https?:\/\/)?(www\.)?(threads\.(net|com))(\/[^\s]*)?(\?[^\s]*)?$/;
    const capcutRegex = /^https:\/\/www\.capcut\.com\/(t\/[A-Za-z0-9_-]+\/?|template-detail\/\d+\?(?:[^=]+=[^&]+&?)+)$/;
    const snackvideoRegex = /^(https?:\/\/)?s\.snackvideo\.com\/p\/[a-zA-Z0-9]+$/i;
    const xiaohongshuRegex = /^(https?:\/\/)?(www\.)?(xiaohongshu\.com\/discovery\/item\/[a-zA-Z0-9]+|xhslink\.com\/[a-zA-Z0-9/]+)(\?.*)?$/i;
    const soundcloudRegex = /^(https?:\/\/)?(www\.|m\.)?soundcloud\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?(\?.*)?$/i;
    const cocofunRegex = /^(https?:\/\/)?(www\.)?icocofun\.com\/share\/post\/\d+(\?.*)?$/i;

    // Evaluasi kecocokan URL dan eksekusi fungsinya masing-masing
    // Perbaikan: Meneruskan object `conn` ke dalam parameter helper agar Baileys dapat merespon
    if (text.match(tiktokRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _tiktok(text.match(tiktokRegex)[0], m, conn);
    } else if (text.match(douyinRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _douyin(text.match(douyinRegex)[0], m, conn);
    } else if (text.match(instagramRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _instagram(text.match(instagramRegex)[0], m, conn);
    } else if (text.match(facebookRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _facebook(text.match(facebookRegex)[0], m, conn);
    } else if (text.match(pinRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _pindl(text.match(pinRegex)[0], m, conn);
    } else if (text.match(youtubeRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _youtube(text.match(youtubeRegex)[0], m, conn);
    } else if (text.match(spotifyRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _spotify(text.match(spotifyRegex)[0], m, conn);
    } else if (text.match(twitterRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _twitter(text.match(twitterRegex)[0], m, conn);
    } else if (text.match(threadsRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _threads(text.match(threadsRegex)[0], m, conn);
    } else if (text.match(capcutRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _capcut(text.match(capcutRegex)[0], m, conn);
    } else if (text.match(snackvideoRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _snackvideo(text.match(snackvideoRegex)[0], m, conn);
    } else if (text.match(xiaohongshuRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _xiaohongshu(text.match(xiaohongshuRegex)[0], m, conn);
    } else if (text.match(soundcloudRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _soundcloud(text.match(soundcloudRegex)[0], m, conn);
    } else if (text.match(cocofunRegex)) {
        conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
        await _cocofun(text.match(cocofunRegex)[0], m, conn);
    }
    
    return true;
};
module.exports = handler;

let old = new Date();
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================================================================
// FITUR MODIFIKASI BERDASARKAN SCRAPERS/API MILIK SENDIRI
// =========================================================================

async function _tiktok(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const { tiktokDl } = require('../lib/tiktok');
            const result = await tiktokDl(link);
            
            const caption = `✅ *Berhasil Diunduh*\n\n👤 *Author:* ${result.author}\n📝 *Deskripsi:* ${result.title}`;

            if (result.images && result.images.length > 0) {
                for (let i = 0; i < result.images.length; i++) {
                    await conn.sendMessage(m.chat, {
                        image: { url: result.images[i] },
                        caption: i === 0 ? caption : '' 
                    }, { quoted: m });
                    await _sleep(1500);
                }
            } else if (result.video) {
                await conn.sendMessage(m.chat, {
                    video: { url: result.video },
                    caption: caption,
                    mimetype: 'video/mp4'
                }, { quoted: m });
            }

            if (result.audio) {
                await _sleep(1000);
                await conn.sendMessage(m.chat, {
                    audio: { url: result.audio },
                    mimetype: 'audio/mp4',
                    fileName: `tiktok_audio.mp3`
                }, { quoted: m });
            }
            global.db.data.users[m.sender].limit -= 1;
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto TikTok Error:", error);
    }
}

async function _instagram(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const { scrapeInstagram } = require('../lib/snapinsta');
            let isSuccess = false;
            let mediaUrls = [];
            let cap = `*I N S T A G R A M*\n\n`;

            try {
                let apiUrl = `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(link)}`;
                let { data } = await axios.get(apiUrl);
                if (!data.status) throw 'Fail API FAA';
                
                let result = data.result;
                if (!result || !result.url || result.url.length === 0) throw 'Media Kosong';
                
                mediaUrls = result.url;
                let meta = result.metadata || {};
                if (meta.username) cap += `◦ *Username:* ${meta.username}\n`;
                if (meta.caption) cap += `◦ *Caption:* \n> ${meta.caption}\n\n`;
                isSuccess = true;
            } catch (e) {
                const snapResult = await scrapeInstagram(link);
                if (snapResult && (snapResult.videos.length > 0 || snapResult.images.length > 0)) {
                    let isReelOrTV = link.match(/\/(reel|tv)\//i);
                    let isOnlyVideos = (snapResult.videos.length > 0 && snapResult.videos.length === snapResult.images.length);

                    if (!(isReelOrTV || isOnlyVideos)) {
                        mediaUrls.push(...snapResult.images);
                    }
                    mediaUrls.push(...snapResult.videos);
                    isSuccess = true;
                }
            }

            if (isSuccess && mediaUrls.length > 0) {
                for (let i = 0; i < mediaUrls.length; i++) {
                    let sendCaption = i === 0 ? cap : '';
                    await conn.sendFile(m.chat, mediaUrls[i], 'igmedia', sendCaption, m);
                    await _sleep(2000);
                }
                global.db.data.users[m.sender].limit -= 1;
            }
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (err) {
        console.error("Auto IG Error:", err);
    }
}

async function _facebook(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const { data } = await axios.get(`https://api.baguss.xyz/api/download/facebook?url=${encodeURIComponent(link)}`);

            if (data.success && data.data && data.data.length > 0) {
                let validMedia = data.data.filter(v => v.url && v.url.startsWith('http'));
                
                if (validMedia.length > 0) {
                    let hd1080 = validMedia.find(v => v.quality.includes('1080p'));
                    let hd720 = validMedia.find(v => v.quality.includes('720p'));
                    let sd = validMedia.find(v => v.quality.includes('360p') || v.quality.includes('SD'));

                    let finalUrl = hd1080 ? hd1080.url : (hd720 ? hd720.url : (sd ? sd.url : validMedia[0].url));
                    let qualityText = hd1080 ? '1080p' : (hd720 ? '720p (HD)' : (sd ? '360p (SD)' : validMedia[0].quality));
                    finalUrl = finalUrl.replace(/&amp;/g, '&');

                    await conn.sendMessage(m.chat, {
                        video: { url: finalUrl },
                        caption: `🎬 *Facebook Video*\n📈 *Kualitas:* ${qualityText}\n\n> _Diunduh menggunakan ${data.creator} API._`
                    }, { quoted: m });

                    global.db.data.users[m.sender].limit -= 1;
                }
            }
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto FB Error:", error);
    }
}

async function _youtube(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const { ytdl } = require('../lib/ytdl');
            // Defaulting ke video 720p untuk Autodownloader
            let res = await ytdl(link, '720');

            if (res.success) {
                let { metadata, download } = res.data;
                let caption = `*[ YOUTUBE DOWNLOADER ]*\n\n *» Judul :* ${metadata.title}\n *» Kualitas :* ${download.quality}p\n *» Tipe :* Video`;

                await conn.sendMessage(m.chat, { 
                    video: { url: download.url }, 
                    mimetype: 'video/mp4', 
                    fileName: download.filename,
                    caption: caption
                }, { quoted: m });

                global.db.data.users[m.sender].limit -= 1;
            }
        } else {
            conn.reply(m.chat, "limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto YT Error:", error);
    }
}

async function _spotify(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const spotify = require('../lib/spotify');
            const res = await spotify.download(link);

            if (res.status) {
                let { title, artist, album, cover, releaseDate } = res.metadata;
                let audioUrl = res.download.mp3;
                let caption = `🎵 *S P O T I F Y - D L*\n\n🎧 *Judul:* ${title}\n🎤 *Artis:* ${artist}\n💿 *Album:* ${album}\n📅 *Rilis:* ${releaseDate}`;

                await conn.sendFile(m.chat, cover, 'cover.jpg', caption, m);
                await conn.sendMessage(m.chat, { 
                    audio: { url: audioUrl }, 
                    mimetype: 'audio/mpeg', 
                    fileName: `${title}.mp3`
                }, { quoted: m });

                global.db.data.users[m.sender].limit -= 1;
            }
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto Spotify Error:", error);
    }
}

async function _twitter(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            let apiUrl = `https://api.nexray.web.id/downloader/twitter?url=${encodeURIComponent(link)}`;
            let response = await fetch(apiUrl);
            let json = await response.json();

            if (json.status && json.result) {
                let { download_url } = json.result;
                let videoData = download_url.find(v => v.type === 'mp4');
                let imageData = download_url.find(v => v.type === 'image');
                
                let mediaUrl = videoData ? videoData.url : (imageData ? imageData.url : null);
                let mediaType = videoData ? 'video' : 'image';

                if (mediaUrl) {
                    let caption = `*X DOWNLOADER*`;
                    if (mediaType === 'video') {
                        await conn.sendFile(m.chat, mediaUrl, 'twitter.mp4', caption, m);
                    } else {
                        await conn.sendFile(m.chat, mediaUrl, 'twitter.jpg', caption, m);
                    }
                    global.db.data.users[m.sender].limit -= 1;
                }
            }
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto Twitter Error:", error);
    }
}

async function _threads(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const apiUrl = `https://api.nexray.web.id/downloader/threads?url=${encodeURIComponent(link)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status && data.result) {
                const { media } = data.result;
                let caption = `🎬 *THREADS DOWNLOADER*`;

                if (media && media.length > 0) {
                    for (let i = 0; i < media.length; i++) {
                        const item = media[i];
                        const finalCaption = i === 0 ? caption : '';
                        await conn.sendFile(m.chat, item.url, '', finalCaption, m);
                        if (media.length > 1) await _sleep(1500);
                    }
                    global.db.data.users[m.sender].limit -= 1;
                }
            }
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto Threads Error:", error);
    }
}

async function _pindl(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const api = await fetch(`https://api.nexray.web.id/downloader/pinterest?url=${encodeURIComponent(link)}`);
            const json = await api.json();
            
            if (json.status && json.result) {
                let data = json.result;
                let titleText = data.title || 'Pinterest Media';
                let formattedCaption = titleText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                let caption = `*${formattedCaption}*`;

                if (data.video) {
                    await conn.sendFile(m.chat, data.video, 'pinterest.mp4', caption, m);
                } else if (data.image || data.thumbnail) {
                    await conn.sendFile(m.chat, data.image || data.thumbnail, 'pinterest.jpg', caption, m);
                }
                global.db.data.users[m.sender].limit -= 1;
            }
        } else {
            conn.reply(m.chat, "limit kamu habis!", m);
        }
    } catch (error) {
        console.error("Auto Pinterest Error:", error);
    }
}


// =========================================================================
// FITUR BAWAAN API BOTCAHX (Tidak diubah, sesuai request jika belum ada scraper lokal)
// =========================================================================

async function _douyin(link, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            let response = await fetch(`https://api.botcahx.eu.org/api/download/douyin?url=${link}&apikey=${btc}`);
            let data = await response.json();
            if (!data.result.video || data.result.video.length === 0) {
                response = await fetch(`https://api.botcahx.eu.org/api/download/douyinslide?url=${link}&apikey=${btc}`);
                data = await response.json();
                if (data.result.images && data.result.images.length > 0) {
                    global.db.data.users[m.sender].limit -= 1;
                    for (let img of data.result.images) {
                        await conn.sendFile(m.chat, img, null, `🍟 *Fetching* : ${(new Date() - old) * 1} ms`, m);
                        await _sleep(3000);
                    }
                    return;
                }
            }
            if (data.result.video && data.result.video.length > 0) {
                global.db.data.users[m.sender].limit -= 1;
                if (data.result.video.length > 1) {
                    for (let v of data.result.video) {
                        await conn.sendFile(m.chat, v, null, `🍟 *Fetching* : ${(new Date() - old) * 1} ms`, m);
                        await _sleep(3000);
                    }
                } else {
                    await conn.sendMessage(m.chat, { video: { url: data.result.video[0] }, caption: `🍟 *Fetching* : ${(new Date() - old) * 1} ms` }, { mention: m });
                }
            }
        } else {
            conn.reply(m.chat, "limit kamu habis!", m);
        }
    } catch (error) {
        console.error(error);
    }
}

async function _capcut(url, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const response = await fetch(`https://api.botcahx.eu.org/api/dowloader/capcut?url=${url}&apikey=${btc}`);
            const res = await response.json();
            const { video } = res.result;
            global.db.data.users[m.sender].limit -= 1;
            await conn.sendFile(m.chat, video, "capcut.mp4", `🍟 *Fetching* : ${(new Date() - old) * 1} ms`, m);
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (e) {
        console.error(e);
    }
}

async function _snackvideo(url, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const api = await fetch(`https://api.botcahx.eu.org/api/download/snackvideo?url=${url}&apikey=${btc}`);
            const res = await api.json();
            const { media } = res.result;
            await conn.sendFile(m.chat, media, null, `🍟 *Fetching* : ${(new Date() - old) * 1} ms`, m);
            global.db.data.users[m.sender].limit -= 1;
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (e) {
        console.log(e);
    }
}

async function _xiaohongshu(url, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            let res = await axios.get(`https://api.botcahx.eu.org/api/download/rednote?url=${url}&apikey=${btc}`);
            let result = res.data.result;
            if (!result || !result.media) throw `Gagal mengambil data!`;
            
            global.db.data.users[m.sender].limit -= 1;
            const media = result.media;

            if (media.videoUrl) {
                await conn.sendMessage(m.chat, { video: { url: media.videoUrl }, caption: `🍟 *Fetching* : ${(new Date() - old) * 1} ms` }, { mention: m });
            } else if (media.images && media.images.length > 0) {
                for (let img of media.images) {
                    await _sleep(3000);
                    await conn.sendMessage(m.chat, { image: { url: img }, caption: `🍟 *Fetching* : ${(new Date() - old) * 1} ms` }, { quoted: m });               
                }
            }
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (e) {
        console.log(e);
    }
}

async function _soundcloud(url, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const res = await fetch(`https://api.botcahx.eu.org/api/download/soundcloud?url=${url}&apikey=${btc}`);
            let anu = await res.json();
            await conn.sendMessage(m.chat, { audio: { url: anu.result.url }, mimetype: "audio/mpeg" }, { quoted: m });
            global.db.data.users[m.sender].limit -= 1;
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (e) {
        console.log(e);
    }
}

async function _cocofun(url, m, conn) {
    try {
        if (global.db.data.users[m.sender].limit > 0) {
            const res = await fetch(`https://api.botcahx.eu.org/api/download/cocofun?url=${encodeURIComponent(url)}&apikey=${btc}`);
            const json = await res.json();
            const videoUrl = json.result.no_watermark || json.result.watermark;
            await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `🍟 *Fetching* : ${(new Date() - old) * 1} ms` }, { mention: m });
            global.db.data.users[m.sender].limit -= 1;
        } else {
            conn.reply(m.chat, "Limit kamu habis!", m);
        }
    } catch (e) {
        console.log(e);
    }
}