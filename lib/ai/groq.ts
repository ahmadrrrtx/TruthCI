import { getEnv } from "@/lib/utils/env";

export async function callGroq(messages: Array<{ role: string; content: string }>) {
  const apiKey = getEnv("GROQ_API_KEY");
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: getEnv("GROQ_MODEL", "llama-3.1-70b-versatile"),
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages
    })
  });
  if (!response.ok) throw new Error(`Groq failed: ${response.status} ${await response.text()}`);
  const json = await response.json();
  return String(json.choices?.[0]?.message?.content ?? "");
}
