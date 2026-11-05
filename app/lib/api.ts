export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (response.status === 401) throw new Error("Garderoben öppnas när du är inloggad i Cursor.");
  if (!response.ok) throw new Error(data.error || "Något gick fel.");
  return data as T;
}

export function compressImage(file: File): Promise<string> {
  if (file.size > 12_000_000) return Promise.reject(new Error("Bilden är för stor. Välj en under 12 MB."));
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 960;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Bilden gick inte att läsa."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const quality = canvas.width * canvas.height > 700_000 ? 0.62 : 0.74;
      const data = canvas.toDataURL("image/jpeg", quality).split(",")[1] ?? "";
      URL.revokeObjectURL(url);
      if (!data) {
        reject(new Error("Spara bilden som JPEG och försök igen."));
        return;
      }
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Spara bilden som JPEG och försök igen."));
    };
    image.src = url;
  });
}
