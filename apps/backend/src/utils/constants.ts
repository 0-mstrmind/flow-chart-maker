import { configDotenv } from "dotenv";

configDotenv();

export const environment = {
  port: process.env.PORT,
  dbURI: process.env.MONGO_URI,
  mode: process.env.NODE_ENV,
  claudeApiKey: process.env.CLAUDE_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY
};
