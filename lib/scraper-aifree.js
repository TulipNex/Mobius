const axios = require('axios');

const BASE_URL = 'https://aifreeforever.com';

// Bypass Cloudflare WAF
async function bypasscf({ url, mode, siteKey } = {}) {
    try {
        const { data } = await axios.post('https://cf.rynekoo.eu.cc/action', {
            url: url,
            mode: mode,
            ...(mode === 'turnstile-min' && { siteKey: siteKey })
        });
        return data;
    } catch (error) {
        throw new Error(`Bypass CF Gagal: ${error.message}`);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Text to Image - AIFreeForever
 * @param {string} userPrompt - Teks deskripsi gambar
 * @param {string} resolution - Resolusi (ex: "1:1", "16:9")
 * @param {string} modelId - Model AI (ex: "flux-fast", "gpt-image-2")
 * @returns {Promise<Object>} JSON Response API
 */
async function textToImage(userPrompt, resolution = "1:1", modelId = "flux-fast") {
    try {
        // Step 1: Memulai Bypass Cloudflare (waf-session)
        const response = await bypasscf({ url: BASE_URL, mode: 'waf-session' });
        const cfData = response.data;
        if (!cfData || !cfData.cookies) throw new Error('Gagal mendapatkan session Cloudflare.');

        const cookieString = cfData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
        const axiosInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                ...(cfData.headers || {}),
                'Cookie': cookieString,
                'Origin': BASE_URL,
                'Referer': `${BASE_URL}/image-generators/${modelId}`,
                'Accept': '*/*'
            }
        });

        // Step 2: Menangani Captcha
        const getCaptcha = await axiosInstance.get('/api/verify-captcha');
        const { sessionId, question } = getCaptcha.data;
        const mathExpression = question.replace('×', '*').replace('=', '').trim();
        // Kalkulasi matematika dasar dari captcha
        const autoAnswer = new Function(`return ${mathExpression}`)(); 

        const verifyRes = await axiosInstance.post('/api/verify-captcha', { 
            sessionId: sessionId, 
            answer: autoAnswer 
        });

        if (!verifyRes.data.verified) throw new Error('Captcha gagal diverifikasi!');
        const verifiedAt = Date.now().toString();

        // Step 3: Enhance Prompt
        const enhancedRes = await axiosInstance.post('/api/enhance-prompt', { prompt: userPrompt });
        const finalPrompt = enhancedRes.data.enhancedPrompt || userPrompt;

        // Delay Keamanan Anti-Spam
        await sleep(2000);

        // Step 4: Generating Image
        const finalResponse = await axiosInstance.post('/api/v2/generate-image', {
            modelId: modelId,
            prompt: finalPrompt,
            aspect_ratio: resolution
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-secret': '',
                'x-captcha-verified-at': verifiedAt
            }
        });

        return finalResponse.data;
    } catch (error) {
        throw new Error(error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

module.exports = textToImage;