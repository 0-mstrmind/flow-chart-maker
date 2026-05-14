import { environment } from "./constants.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: environment.openaiApiKey,
});

/**
 * Sanitize Mermaid output: fix common model hallucinations
 * before sending to the client.
 */
function sanitize(raw: string): string {
  return raw
    .replace(/^```(?:mermaid)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .split("\n")
    .map((line) => {
      // normalize flowchart -> graph
      line = line.replace(/^(\s*)flowchart\s+(TD|LR|BT|RL)/i, "$1graph $2");
      // fix --[ typo -> -->
      line = line.replace(/--\[/g, "-->");
      // fix ---> -> -->
      line = line.replace(/--->/g, "-->");
      // fix stadium shapes ([text]) -> (text)
      line = line.replace(/\(\[([^\]]*)\]\)/g, "($1)");
      // fix hexagon {{text}} -> {text}
      line = line.replace(/\{\{([^}]*)\}\}/g, "{$1}");
      return line;
    })
    .join("\n")
    .trim();
}

export async function prompt(userQuery: string): Promise<string> {
  const systemPrompt = `You are a Mermaid diagram generator.

Output ONLY valid Mermaid code starting with "graph TD" or "graph LR".
No markdown. No backticks. No explanation. Just the raw Mermaid code.

Node shapes you are allowed to use:
  A[Label]   = rectangle
  A(Label)   = rounded rectangle  
  A{Label}   = diamond

Arrow syntax you MUST use:
  A --> B          (plain connection)
  A -- text --> B  (labeled connection)

DO NOT use:
  ([Label])  - invalid
  --[        - invalid  
  ->         - invalid
  --->       - invalid
  {{Label}}  - invalid
  >Label]    - invalid

Example of correct output:
graph TD
  A(Start) --> B[Enter username and password]
  B --> C{Credentials valid?}
  C -- Yes --> D[Load dashboard]
  C -- No --> E[Show error message]
  E --> B
  D --> F(End)`;

  const generate = async (): Promise<string> => {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a Mermaid diagram for: ${userQuery}` },
      ],
    });
    return sanitize(response.choices[0]!.message.content!);
  };

  // Try up to 2 times if the output looks malformed
  let result = await generate();
  if (!result.startsWith("graph")) {
    result = await generate();
  }

  return result;
}