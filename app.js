require("./console-timestamp");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const sendTelegramMessage = require("./sendTelegram");
const { sendTelegramPhoto } = require("./sendTelegram");
const { sendTelegramPhotoFromUrl } = require("./sendTelegram");
const { sendTelegramMessageWithPhoto } = require("./sendTelegram");
const { chatWithGPT, getQuoteDailyResponse } = require("./chatGPT");
const cron = require("node-cron");
const { pickNewMeme } = require("./memeScheduler");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.post("/send-now", async (req, res) => {
  try {
    const meme = await pickNewMeme();
    console.log("[send-now] Sending meme to Telegram (download first):", meme.url);
    await sendTelegramPhotoFromUrl(meme.url, meme.caption);
    console.log("[send-now] Sent meme to Telegram successfully");
    res.json({ success: true, type: "photo", usedImageUrl: meme.url, caption: meme.caption });
  } catch (err) {
    console.error("[send-now] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-now-text", async (req, res) => {
  const { text } = req.body;
  const caption = text || "No, this is not your first day.";
  try {
    await sendTelegramMessage(caption);
    res.json({ success: true, type: "text", sent: caption });
  } catch (err) {
    console.error("[send-now-text] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-now-preview", async (req, res) => {
  try {
    let photoUrl = req.body.photo;
    let caption = req.body.caption;
    if (!photoUrl) {
      const meme = await pickNewMeme();
      photoUrl = meme.url;
      caption = meme.caption;
    }
    console.log("[send-now-preview] Sending meme as preview link:", photoUrl);
    await sendTelegramMessageWithPhoto(photoUrl, caption || "No, this is not your first day.");
    console.log("[send-now-preview] Sent meme as preview link successfully");
    res.json({ success: true, type: "preview", usedImageUrl: photoUrl, caption });
  } catch (err) {
    console.error("[send-now-preview] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/send-now-photo", async (req, res) => {
  try {
    let photoUrl = req.body.photo;
    let caption = req.body.caption;
    if (!photoUrl) {
      const meme = await pickNewMeme();
      photoUrl = meme.url;
      caption = meme.caption;
    }
    console.log("[send-now-photo] Sending photo via sendPhoto:", photoUrl);
    await sendTelegramPhoto(photoUrl, caption || "No, this is not your first day.");
    console.log("[send-now-photo] Sent photo via sendPhoto successfully");
    res.json({ success: true, type: "photo", usedImageUrl: photoUrl, caption });
  } catch (err) {
    console.error("[send-now-photo] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/daily-report", async (req, res) => {
  try {
    const content = await getQuoteDailyResponse();
    await sendTelegramMessage(content);
    res.status(200).json({
      success: true,
      message: content,
    });
  } catch (err) {
    console.error("Meme schedule error:", err);
    res.status(500).json({ success: false, message: "Error" });
  }
});

app.post("/remind-lunch", async (req, res) => {
  try {
    const store = [
      "Cơm chiên & Mỳ trộn MunPi",
      "Cơm tấm Long Xuyên",
      "Cơm Bình Dân - Dạ Nam",
      "Cơm tấm Ngô Quyền",
      "Nhà Xưa",
      "Cơm Minh nhà làm",
      "Cơm gà xối mỡ Đông Phát",
      "Cơm tấm Trúc Thủy",
      "Cơm trưa cô 8 - Đào Cam Mộc",
    ];
    const randomStore = store[Math.floor(Math.random() * store.length)];
    const content = await chatWithGPT(
      `Hãy cho tôi một tin nhắn ngắn gọn giống như một cô gái đôi mươi nhắc nhở các anh đồng nghiệp để đặt cơm trưa của quán ${randomStore} - chỉ trả lời bằng tiếng Việt`
    );
    await sendTelegramMessage(content);
    res.status(200).json({
      success: true,
      message: content,
    });
  } catch (err) {
    console.error("Meme schedule error:", err);
    res.status(500).json({ success: false, message: "Error" });
  }
});

const cronSchedule = process.env.CRON_SCHEDULE || "0 9,13,18,21 * * *";
cron.schedule(
  cronSchedule,
  async () => {
    try {
      const meme = await pickNewMeme();
      console.log("[schedule] Sending meme to Telegram (download first):", meme.url);
      await sendTelegramMessageWithPhoto(meme.url, meme.caption || "No, this is not your first day.");
      console.log("[schedule] Sent meme to Telegram successfully");
    } catch (err) {
      console.error("Meme schedule error:", err);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);

cron.schedule(
  "0 9,17 * * *", // 9h sáng và 17h chiều mỗi ngày
  async () => {
    try {
      const content = await getQuoteDailyResponse();
      await sendTelegramMessage(content);
    } catch (err) {
      console.error("Meme schedule error:", err);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);

cron.schedule(
  "15 11 * * *", // 11h15
  async () => {
    try {
      const store = [
        "Cơm chiên & Mỳ trộn MunPi",
        "Cơm tấm Long Xuyên",
        "Cơm Bình Dân - Dạ Nam",
        "Cơm tấm Ngô Quyền",
        "Nhà Xưa",
        "Cơm Minh nhà làm",
        "Cơm gà xối mỡ Đông Phát",
        "Cơm tấm Trúc Thủy",
        "Cơm trưa cô 8 - Đào Cam Mộc",
      ];
      const randomStore = store[Math.floor(Math.random() * store.length)];
      let content = '';
      try {
        content = await chatWithGPT(
          `Hãy cho tôi một tin nhắn ngắn gọn giống như một cô gái đôi mươi nhắc nhở các anh đồng nghiệp để đặt cơm trưa của quán ${randomStore} - chỉ trả lời bằng tiếng Việt`
        );
      } catch (error) {
        console.error("Meme schedule error:", error);
        content = `No. This is not your first day.\n ${randomStore}`;
      }
      await sendTelegramMessage(content);
    } catch (err) {
      console.error("Meme schedule error:", err);
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  }
);

module.exports = app;
