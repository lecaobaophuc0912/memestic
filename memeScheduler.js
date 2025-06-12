const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const SENT_MEMES_FILE = path.join(__dirname, 'sent_memes.json');
const FIXED_CAPTION = 'No, this is not your first day.';
const REDDIT_ENDPOINTS = [
    'https://www.reddit.com/r/programmingmemes/top.json?limit=50',
    'https://www.reddit.com/r/programmingmemes/hot.json?limit=50',
    'https://www.reddit.com/r/programmingmemes/new.json?limit=50',
    'https://www.reddit.com/r/programmingmemes/rising.json?limit=50',
    'https://www.reddit.com/r/programmingmemes/random.json?limit=10'
];

function readSentMemes() {
    if (!fs.existsSync(SENT_MEMES_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(SENT_MEMES_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveSentMemes(memes) {
    fs.writeFileSync(SENT_MEMES_FILE, JSON.stringify(memes, null, 2));
}

async function fetchRedditMemes(endpoint) {
    console.log(`[memeScheduler] Fetching memes from: ${endpoint}`);
    try {
        const res = await fetch(endpoint, { headers: { 'User-Agent': 'memestic-bot/1.0' } });
        const data = await res.json();
        if (!data.data || !data.data.children) {
            console.log(`[memeScheduler] No data.children from: ${endpoint}`);
            return [];
        }
        const images = data.data.children
            .map(post => post.data)
            .filter(post => post.post_hint === 'image' && post.url && post.id)
            .map(post => {
                // Luôn trả về url ảnh gốc của Reddit
                return { ...post, url: post.url };
            });
        console.log(`[memeScheduler] Found ${images.length} images from: ${endpoint}`);
        return images;
    } catch (err) {
        console.error(`[memeScheduler] Error fetching from ${endpoint}:`, err.message);
        return [];
    }
}

async function pickNewMeme() {
    const sentMemes = readSentMemes();
    console.log(`[memeScheduler] Sent memes loaded: ${sentMemes.length}`);
    for (const endpoint of REDDIT_ENDPOINTS) {
        const memes = await fetchRedditMemes(endpoint);
        const unused = memes.filter(meme => !sentMemes.includes(meme.id));
        console.log(`[memeScheduler] Unused memes from ${endpoint}: ${unused.length}`);
        if (unused.length > 0) {
            const meme = unused[Math.floor(Math.random() * unused.length)];
            sentMemes.push(meme.id);
            saveSentMemes(sentMemes);
            console.log(`[memeScheduler] Picked meme: ${meme.id} - ${meme.url}`);
            return { url: meme.url, caption: meme.title || FIXED_CAPTION };
        }
    }
    console.error('[memeScheduler] No new memes found from any endpoint!');
    throw new Error('No new memes found from any endpoint!');
}

module.exports = { pickNewMeme }; 