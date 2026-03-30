module.exports = {
  provider: process.env.AI_PROVIDER || "gemini",

  models: {
    gemini: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
};
