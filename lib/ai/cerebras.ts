import { getEnv } from "@/lib/utils/env";

export async function callCerebras(messages: Array<{ role: string; content: string }>) {
  const apiKey = getEnv("CEREBRAS_API_KEY");
  if (!apiKey) throw new Error("CEREBRAS_API_KEY is not configured");
  const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: getEnv("CEREBRAS_MODEL", "llama3.1-70b"),
      temperature: 0.2,
      messages
    })
  });
  if (!response.ok) throw new Error(`Cerebras failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  return String(json.choices?.[0]?.message?.content ?? "");
}
