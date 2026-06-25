/* global process */
import { buildClaudePrompt, INSIGHTS_SYSTEM } from "../src/lib/aiInsights.js";

// Cheap + fast; this only summarizes a handful of numbers.
const MODEL = "claude-haiku-4-5-20251001";

// Vercel serverless function. Holds the Anthropic key server-side so it is
// never shipped to the browser, and proxies a single Messages API call.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "AI summary isn't configured yet (missing API key)." });
    return;
  }

  const stats = req.body?.stats;
  if (!stats || typeof stats !== "object") {
    res.status(400).json({ error: "Missing stats." });
    return;
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: INSIGHTS_SYSTEM,
        messages: [{ role: "user", content: buildClaudePrompt(stats) }],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      res.status(502).json({
        error: "The AI service returned an error.",
        detail: detail.slice(0, 300),
      });
      return;
    }

    const data = await resp.json();
    const summary = (data.content || [])
      .map((block) => block.text || "")
      .join("")
      .trim();

    if (!summary) {
      res.status(502).json({ error: "Empty response from the AI service." });
      return;
    }

    res.status(200).json({ summary });
  } catch {
    res.status(500).json({ error: "Could not generate a summary right now." });
  }
}
