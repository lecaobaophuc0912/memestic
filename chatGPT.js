require("dotenv").config();
const fetch = require("node-fetch");

/**
 * Function để chat với ChatGPT
 * @param {string} message - Tin nhắn cần gửi
 * @param {string} model - Model GPT sử dụng (mặc định: gpt-3.5-turbo)
 * @returns {Promise<string>} - Câu trả lời từ ChatGPT
 */
async function chatWithGPT(message, model = "openai/gpt-3.5-turbo-16k") {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY không được tìm thấy trong environment variables");
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Lỗi khi chat với ChatGPT:", error.message);
    throw error;
  }
}

/**
 * Function để chat với context (lưu lịch sử chat)
 * @param {Array} conversation - Mảng chứa lịch sử chat
 * @param {string} newMessage - Tin nhắn mới
 * @param {string} model - Model GPT sử dụng
 * @returns {Promise<Object>} - Trả về câu trả lời và conversation mới
 */
async function chatWithContext(conversation = [], newMessage, model = "gpt-3.5-turbo") {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY không được tìm thấy trong environment variables");
    }

    // Thêm tin nhắn mới vào conversation
    const updatedConversation = [...conversation, { role: "user", content: newMessage }];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: updatedConversation,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Trả về câu trả lời và conversation mới
    return {
      response: assistantMessage,
      conversation: [...updatedConversation, { role: "assistant", content: assistantMessage }],
    };
  } catch (error) {
    console.error("Lỗi khi chat với context:", error.message);
    throw error;
  }
}

async function getQuoteDailyResponse() {
  const quote = await chatWithGPT(
    "Hãy cho tôi một câu quote truyền cảm hứng làm việc đối với một lập trình viên - chỉ trả lời bằng tiếng Việt"
  );
  const url = "https://docs.google.com/spreadsheets/d/1zitdZCFNoX_u6xz83guKCmNX6dH8sGXoPOPm7bcSQUE/edit?usp=sharing";
  return `${quote}\n\nMột câu quote tạo cảm hứng làm việc đúng không nào. Đúng rồi thì mọi người nhớ nhập công việc mình làm vào đây nhé, không đúng thì cũng nhập nhé\n${url}`;
}

module.exports = {
  chatWithGPT,
  chatWithContext,
  getQuoteDailyResponse,
};
