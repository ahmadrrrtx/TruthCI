import dns from "node:dns/promises";
import net from "node:net";

const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"
]);

export function normalizeUrl(input: string) {
  const raw = input.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL must use http or https");
  }
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

export function sameOrigin(a: string, b: string) {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function isProbablyAsset(urlString: string) {
  const path = new URL(urlString).pathname.toLowerCase();
  return /\.(pdf|zip|gz|tar|png|jpe?g|gif|svg|webp|mp4|mov|mp3|css|js|ico|woff2?|ttf|eot)$/i.test(path);
}

function isPrivateIp(ip: string) {
  if (ip === "169.254.169.254") return true;
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254) ||
      parts[0] === 0
    );
  }
  return ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80");
}

export async function assertPublicHttpUrl(input: string) {
  const normalized = normalizeUrl(input);
  const parsed = new URL(normalized);
  const host = parsed.hostname;
  if (["localhost", "local"].includes(host) || host.endsWith(".local")) {
    throw new Error("Localhost and private network URLs are not allowed");
  }
  if (net.isIP(host) && isPrivateIp(host)) {
    throw new Error("Private network URLs are not allowed");
  }
  if (process.env.NODE_ENV === "production") {
    try {
      const records = await dns.lookup(host, { all: true });
      if (records.some((record) => isPrivateIp(record.address))) {
        throw new Error("URL resolves to a private network address");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("private")) throw error;
    }
  }
  return normalized;
}
