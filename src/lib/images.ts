const MAX_CHARS = 700_000;
const MAX_BYTES = 450_000;

export function sniffImage(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function decodeImage(data: unknown): { mime: "image/jpeg" | "image/png" | "image/webp"; data: string } | null {
  if (typeof data !== "string" || data.length === 0 || data.length > MAX_CHARS) return null;
  const cleaned = data.replace(/^data:[^,]*,/, "").replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) return null;
  const buf = Buffer.from(cleaned, "base64");
  if (buf.length < 32 || buf.length > MAX_BYTES) return null;
  const mime = sniffImage(buf);
  if (!mime) return null;
  return { mime, data: buf.toString("base64") };
}
