import type { PlayResponse } from "../types/play";

const BASE_URL = "https://stream2.anshbotzone.com";

export async function fetchPlayById(url_id: string): Promise<PlayResponse> {
  const res = await fetch(`${BASE_URL}/api/play/id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url_id }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data as PlayResponse;
}

export async function fetchPlayByMeta(
  url: string,
  meta: string
): Promise<PlayResponse> {
  const res = await fetch(`${BASE_URL}/api/play/meta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, meta }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data as PlayResponse;
}