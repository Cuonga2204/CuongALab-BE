const axios = require("axios");
const Category = require("../models/CategoryModel");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/* ===== SAFE JSON ===== */
const extractJson = (text) => {
  if (!text) throw new Error("Empty AI response");

  return JSON.parse(
    text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()
  );
};

/* ===== BUILD PROMPT ===== */
const buildPrompt = async ({ goals, level, description, raw_interests }) => {
  const roots = await Category.find(
    { level: 1, is_active: true },
    { name: 1, slug: 1 }
  );

  const rootText = roots.map((r) => `- ${r.slug}: ${r.name}`).join("\n");

  return `
Bạn là hệ thống định hướng học tập.

CHỈ trả về JSON thuần, không giải thích.

Schema:
{
  "category_root": "<slug>"
}

Danh sách lĩnh vực hợp lệ:
${rootText}

Luật:
- Chỉ chọn 1 slug trong danh sách
- Không tự tạo slug mới
- Ưu tiên theo raw_interests nếu hợp lý

Thông tin người dùng:
- Mục tiêu: ${(goals || []).join(", ")}
- Trình độ: ${level}
- Quan tâm (user chọn): ${(raw_interests || []).join(", ")}
- Mô tả: ${description || "Không có"}
`;
};

/* ===== ANALYZE ===== */
const analyzeOnboarding = async (input) => {
  const prompt = await buildPrompt(input);

  const res = await axios.post(
    GEMINI_URL,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
    }
  );

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return extractJson(text);
};

module.exports = { analyzeOnboarding };
