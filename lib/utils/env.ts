export function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") return undefined;
  return value;
}

export function requireEnv(name: string) {
  const value = getEnv(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
