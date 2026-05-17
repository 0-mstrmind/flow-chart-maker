import { environment } from "./constants.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: environment.openaiApiKey,
});

const MERMAID_RULES = `
OUTPUT RULES (follow strictly):
- Output ONLY raw Mermaid code. No markdown, no backticks, no explanation.
- Always start with "graph TD" or "graph LR".
- Allowed node shapes:
    A[Label]   = rectangle
    A(Label)   = rounded rectangle
    A{Label}   = diamond
- Arrows:
    A --> B             (plain)
    A -- text --> B     (labeled)
- Node IDs: short alphanumeric words only (A, B, login, step1).
- NEVER use: ([Label])  --[  ->  --->  {{Label}}  >Label]
`;

/**
 * Sanitize Mermaid output: fix common model hallucinations.
 */
function sanitize(raw: string): string {
  return raw
    .replace(/^```(?:mermaid)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .split("\n")
    .map((line) => {
      line = line.replace(/^(\s*)flowchart\s+(TD|LR|BT|RL)/i, "$1graph $2");
      line = line.replace(/--\[/g, "-->");
      line = line.replace(/--->/g, "-->");
      line = line.replace(/\(\[([^\]]*)\]\)/g, "($1)");
      line = line.replace(/\{\{([^}]*)\}\}/g, "{$1}");
      return line;
    })
    .join("\n")
    .trim();
}

/**
 * Generate a brand-new diagram from a user description.
 */
export async function generateDiagram(userQuery: string): Promise<string> {
  const systemPrompt = `You are a Mermaid diagram generator.
${MERMAID_RULES}
Example of correct output:
graph TD
  A(Start) --> B[Enter username and password]
  B --> C{Credentials valid?}
  C -- Yes --> D[Load dashboard]
  C -- No --> E[Show error message]
  E --> B
  D --> F(End)`;

  const call = async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a Mermaid diagram for: ${userQuery}`,
        },
      ],
    });
    return sanitize(response.choices[0]!.message.content!);
  };

  let result = await call();
  if (!result.startsWith("graph")) result = await call();
  return result;
}

/**
 * Edit an existing diagram based on a user instruction.
 * The current Mermaid code is included so the AI can make targeted changes.
 */
export async function editDiagram(
  currentMermaid: string,
  editInstruction: string
): Promise<string> {
  const systemPrompt = `You are a Mermaid diagram editor.
You will receive an existing Mermaid diagram and instructions to modify it.
Apply ONLY the requested changes. Keep everything else the same.
${MERMAID_RULES}`;

  const call = async () => {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Current diagram:\n${currentMermaid}\n\nEdit instruction: ${editInstruction}\n\nOutput the updated Mermaid code only.`,
        },
      ],
    });
    return sanitize(response.choices[0]!.message.content!);
  };

  let result = await call();
  if (!result.startsWith("graph")) result = await call();
  return result;
}

// Keep backward compat with existing import in controller
export const prompt = generateDiagram;