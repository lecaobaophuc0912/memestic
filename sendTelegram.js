require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
// const { HttpsProxyAgent } = require('https-proxy-agent');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_GROUP_ID;
const threadId = process.env.TELEGRAM_THREAD_ID;

async function sendTelegramMessage(message) {
    try {
        if (!token || !chatId) {
            throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID in .env');
        }
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const body = {
            chat_id: chatId,
            text: message
        };
        if (threadId) body.message_thread_id = Number(threadId);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!data.ok) {
            throw new Error('Telegram API error: ' + JSON.stringify(data));
        }
        return data;
    } catch (err) {
        console.error('[sendTelegramMessage] Error:', err);
        throw err;
    }
}

async function sendTelegramPhoto(photoUrl, caption = '') {
    try {
        if (!token || !chatId) {
            throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID in .env');
        }
        const url = `https://api.telegram.org/bot${token}/sendPhoto`;
        const body = {
            chat_id: chatId,
            photo: photoUrl,
            caption: caption
        };
        if (threadId) body.message_thread_id = Number(threadId);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!data.ok) {
            throw new Error('Telegram API error: ' + JSON.stringify(data));
        }
        return data;
    } catch (err) {
        console.error('[sendTelegramPhoto] Error:', err);
        throw err;
    }
}

async function sendTelegramPhotoFromUrl(imageUrl, caption = '') {
    try {
        if (!token || !chatId) {
            throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID in .env');
        }
        console.log('[sendTelegramPhotoFromUrl] Bắt đầu tải ảnh:', imageUrl);
        // Tải ảnh về file tạm
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error('Failed to download image: ' + imageUrl);
        const ext = path.extname(imageUrl).split('?')[0] || '.jpg';
        const tempPath = path.join(__dirname, 'temp_telegram_photo' + ext);
        const fileStream = fs.createWriteStream(tempPath);
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on('error', (err) => {
                console.error('[sendTelegramPhotoFromUrl] Lỗi khi tải ảnh:', err);
                reject(err);
            });
            fileStream.on('finish', () => {
                console.log('[sendTelegramPhotoFromUrl] Đã lưu file tạm:', tempPath);
                resolve();
            });
        });
        // Gửi file lên Telegram
        console.log('[sendTelegramPhotoFromUrl] Đang gửi file lên Telegram:', tempPath);
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('caption', caption);
        form.append('photo', fs.createReadStream(tempPath));
        if (threadId) form.append('message_thread_id', Number(threadId));
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: 'POST',
            body: form
        });
        const data = await tgRes.json();
        // Xóa file tạm
        fs.unlinkSync(tempPath);
        console.log('[sendTelegramPhotoFromUrl] Đã xóa file tạm:', tempPath);
        if (!data.ok) {
            console.error('[sendTelegramPhotoFromUrl] Telegram API error:', data);
            throw new Error('Telegram API error: ' + JSON.stringify(data));
        }
        console.log('[sendTelegramPhotoFromUrl] Gửi thành công!');
        return data;
    } catch (err) {
        console.error('[sendTelegramPhotoFromUrl] Error:', err);
        throw err;
    }
}

async function sendTelegramMessageWithPhoto(photoUrl, caption = '') {
    try {
        if (!token || !chatId) {
            throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID in .env');
        }
        // Gửi tin nhắn với ảnh dạng preview (Markdown)
        const text = `${caption}\n<a href=\"${photoUrl}\">\u200b</a>`;
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: false
        };
        if (threadId) body.message_thread_id = Number(threadId);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!data.ok) {
            throw new Error('Telegram API error: ' + JSON.stringify(data));
        }
        return data;
    } catch (err) {
        console.error('[sendTelegramMessageWithPhoto] Error:', err);
        throw err;
    }
}

module.exports = sendTelegramMessage;
module.exports.sendTelegramPhoto = sendTelegramPhoto;
module.exports.sendTelegramPhotoFromUrl = sendTelegramPhotoFromUrl;
module.exports.sendTelegramMessageWithPhoto = sendTelegramMessageWithPhoto;


