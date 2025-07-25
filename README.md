# Reddit Memestic Bot

This bot automatically fetches memes from the subreddit [r/programmingmemes](https://www.reddit.com/r/programmingmemes/) and sends them to a Telegram group or topic on a schedule or via API trigger.

## Features

- Fetches new memes from Reddit, avoids duplicates
- Sends memes to Telegram group, supergroup, or forum topic
- Supports sending text, photo, and preview link
- Automatic meme schedule via cron (default: 9h, 13h, 18h, 21h)
- API triggers for sending meme/text/preview/photo on demand
- Easy configuration via `.env` file
- Supports running with Docker/Docker Compose

## Configuration

Create a `.env` file (or copy from `env.template`):

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_GROUP_ID=your_group_id_here
TELEGRAM_THREAD_ID=1 # (optional, for forum topic)
CRON_SCHEDULE=0 9,13,18,21 * * *
```

- Get `TELEGRAM_BOT_TOKEN` from BotFather
- Get `TELEGRAM_GROUP_ID` by adding the bot to your group, sending a message, then using getUpdates
- Get `TELEGRAM_THREAD_ID` by sending a message in the topic, then checking `message_thread_id` in getUpdates

## Local Setup & Run

```bash
git clone https://github.com/lecaobaophuc0912/memestic.git
cd memestic
npm install
cp env.template .env # and edit values as needed
npm run dev # or npm start
```

## Run with Docker

```bash
docker-compose up --build -d
```

- Place your `.env` file in the same directory as `docker-compose.yml`
- Port 4000 will be mapped to the host

## API Endpoints

- `POST /send-now` : Send a new meme (original Reddit image, caption is the Reddit title)
- `POST /send-now-text` : Send text to Telegram
- `POST /send-now-photo` : Send photo (provide url or fetch new meme)
- `POST /send-now-preview` : Send meme as a preview link (Telegram auto-displays image)

**Examples:**

```bash
curl -X POST http://localhost:4000/send-now -H "Content-Type: application/json" -d '{}'
curl -X POST http://localhost:4000/send-now-text -H "Content-Type: application/json" -d '{"text":"Hello"}'
curl -X POST http://localhost:4000/send-now-photo -H "Content-Type: application/json" -d '{"photo":"https://i.imgur.com/your-image.jpg"}'
curl -X POST http://localhost:4000/send-now-preview -H "Content-Type: application/json" -d '{"photo":"https://i.imgur.com/your-image.jpg"}'
```

## Notes

- Do not commit your real `.env` file to GitHub
- To reset sent memes, delete the `sent_memes.json` file
- If sending to a forum topic, ensure the correct `TELEGRAM_THREAD_ID`
- If Telegram API is blocked, consider running the bot on an overseas VPS or using a SOCKS5 proxy/VPN

## License

MIT

docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" \
 -p 1433:1433 --name sqlserver \
 -d mcr.microsoft.com/mssql/server:2022-latest

## Docker build & run (production)

1. **Tạo file cấu hình môi trường:**

   - Copy file `env.template` thành `env.prod` và chỉnh sửa giá trị cho phù hợp.
   - Ví dụ:
     ```sh
     cp env.template env.prod
     # Sau đó chỉnh sửa file env.prod nếu cần
     ```

2. **Build & Run với Docker Compose:**

   ```sh
   docker-compose up -d
   ```

   - Đảm bảo file `env.prod` nằm cùng thư mục với `docker-compose.yml`.
   - Nếu lần đầu chạy hoặc có thay đổi code, có thể thêm `--build`:
     ```sh
     docker-compose up --build -d
     ```
   - Port 4000 sẽ được map ra ngoài, biến môi trường sẽ tự động nạp từ file `env.prod`.
   - Container sẽ tự động restart nếu Docker daemon khởi động lại (theo cấu hình `restart: unless-stopped`).

3. **(Tùy chọn) Xem log container:**

   ```sh
   docker-compose logs -f
   ```

4. **(Tùy chọn) Dừng container:**
   ```sh
   docker-compose down
   ```
