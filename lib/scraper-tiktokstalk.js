const axios = require('axios');

/**
 * [ API REVERSE ENGINEERING & SCRAPING ]
 * Scraper TikTok Profile (BitChipDigital / XRespond)
 * Mengekstrak informasi bio dan daftar video dari target user
 */
async function ttStalk(username) {
    try {
        // Membersihkan input (menghilangkan @ dan spasi)
        let user = username.replace('@', '').trim();
        
        // Asumsi payload umum pada web scraper berbasis URL
        let targetUrl = `https://www.tiktok.com/@${user}`;

        const url = 'https://tools.xrespond.com/api/tiktok/profile/videos';
        
        // Header Spoofing WAF Bypass
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Origin': 'https://bitchipdigital.com',
            'Referer': 'https://bitchipdigital.com/tools/social-media/tiktok/bio/',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site'
        };

        // Kirim payload dengan parameter wajib 'profile' sesuai permintaan API
        const data = {
            profile: targetUrl 
        };

        const response = await axios.post(url, data, { headers });

        // Validasi struktur JSON berdasarkan Response
        if (response.data && response.data.status === 'success' && response.data.data?.data?.videos) {
            const videos = response.data.data.data.videos;
            
            if (videos.length === 0) {
                throw new Error('Tidak ada video ditemukan atau akun di-private.');
            }
            
            // Ambil data profile dari objek 'author' pada video urutan pertama
            const authorInfo = videos[0].author;
            
            return {
                username: authorInfo.unique_id,
                nickname: authorInfo.nickname,
                avatar: authorInfo.avatar,
                // Mengambil 5 video terbaru sebagai informasi ekstra
                latest_videos: videos.slice(0, 5).map(v => ({
                    title: v.title,
                    play_count: v.play_count,
                    like_count: v.digg_count,
                    comment_count: v.comment_count,
                    share_count: v.share_count,
                    duration: v.duration,
                    url: `https://www.tiktok.com/@${authorInfo.unique_id}/video/${v.video_id}`
                }))
            };
        } else {
            throw new Error('Data profile tidak ditemukan atau API membatasi akses.');
        }
    } catch (error) {
        console.error('[TikTok Stalk API Error]', error.response?.data || error.message);
        throw error; 
    }
}

module.exports = { ttStalk };