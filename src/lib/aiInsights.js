// Shared (browser + serverless) helpers for the AI insight feature.
// Pure functions only — no network, no secrets. The serverless function in
// /api/insights.js imports buildClaudePrompt + INSIGHTS_SYSTEM from here.

const round1 = (n) => Math.round((n || 0) * 10) / 10;

// Guardrail prompt: friendly, concise, and explicitly NOT medical advice.
export const INSIGHTS_SYSTEM = [
  "You are a warm, encouraging assistant inside a baby-tracking app used by new parents.",
  "Given a few summary numbers, write a short, plain-language read of what they show.",
  "Rules:",
  "- 2 to 4 short sentences. Friendly and supportive, never alarming.",
  "- Describe trends and averages in everyday terms. You may gently note something worth keeping an eye on.",
  "- Do NOT give medical or diagnostic advice, dosages, or sleep/feeding prescriptions.",
  "- If something looks unusual, suggest mentioning it to their pediatrician rather than interpreting it yourself.",
  "- If there isn't enough data yet, say so kindly and encourage them to keep logging.",
  "- Plain text only — no markdown headings, no bullet points.",
].join("\n");

// Shapes raw insight-hook output into a clean stats object to send to the API.
export function buildInsightsStats({ babyName, days, sleep = {}, feed = {} }) {
  return {
    babyName: babyName || "Baby",
    days,
    avgSleepHoursPerDay: round1((sleep.avgMinutesPerDay || 0) / 60),
    longestSleepStretchHours: round1((sleep.longestStretchMinutes || 0) / 60),
    feedsPerDay: feed.feedsPerDay || 0,
    avgBottleMl: feed.avgMlPerBottleFeed || 0,
    breastFeeds: feed.typeBreakdown?.breast || 0,
    bottleFeeds: feed.typeBreakdown?.bottle || 0,
  };
}

// Builds the user message sent to Claude from the shaped stats.
export function buildClaudePrompt(stats) {
  return [
    `Here are ${stats.babyName}'s tracked numbers over the last ${stats.days} days:`,
    `- Average sleep per day: ${stats.avgSleepHoursPerDay} hours`,
    `- Longest single sleep stretch: ${stats.longestSleepStretchHours} hours`,
    `- Feeds per day: ${stats.feedsPerDay}`,
    `- Average bottle size: ${stats.avgBottleMl} ml`,
    `- Feed mix: ${stats.breastFeeds} breastfeeds, ${stats.bottleFeeds} bottle feeds`,
    "",
    "Give a short, friendly summary of what these numbers show.",
  ].join("\n");
}
