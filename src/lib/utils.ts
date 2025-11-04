import { ListSong, PlayerSongType } from "@/config/types";
import { coolIndoNames } from "@/config/username";
import { BoxSong, BoxSongStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomUsername() {
  return coolIndoNames[Math.floor(Math.random() * coolIndoNames.length)];
}

export function parseYouTubeDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

export function normalizeTitle(title: string): string {
  let clean = title
    .replace(/\(.*?\)/g, "") // hapus isi tanda kurung
    .replace(/\[.*?\]/g, "") // hapus isi kurung siku
    .replace(/official\s*video/gi, "")
    .replace(/lyrics?/gi, "")
    .replace(/audio/gi, "")
    .replace(/topic/gi, "")
    .replace(/vevo/gi, "")
    .replace(/feat\.?|ft\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // ambil bagian kanan dari "Artist - Song"
  if (clean.includes(" - ")) {
    const parts = clean.split(" - ");
    clean = parts[parts.length - 1];
  }

  // ambil bagian kanan dari "Artist – Song" (en dash)
  if (clean.includes(" – ")) {
    const parts = clean.split(" – ");
    clean = parts[parts.length - 1];
  }

  return clean.trim();
}

/**
 * Bersihkan nama artis (hapus VEVO, Topic, Channel style)
 */
export function sanitizeArtistName(artist: string): string {
  return artist
    .replace(/vevo$/i, "") // hapus VEVO di akhir
    .replace(/- topic$/i, "") // hapus - Topic
    .replace(/official$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ekstrak nama artis dari title.
 * Bisa handle format "Artist - Song", "Song by Artist", dan variasinya.
 */
export function extractArtistFromTitle(title: string): string | null {
  const normalized = title.trim();

  // Case umum: "Artist - Song"
  if (normalized.includes(" - ")) {
    const [artist] = normalized.split(" - ");
    return sanitizeArtistName(artist);
  }

  // Case: "Song by Artist"
  const byMatch = normalized.match(/by\s+(.+)/i);
  if (byMatch) {
    return sanitizeArtistName(byMatch[1]);
  }

  // Case: "Artist – Song" (unicode en dash)
  if (normalized.includes(" – ")) {
    const [artist] = normalized.split(" – ");
    return sanitizeArtistName(artist);
  }

  // Case fallback: kalau ada VEVO di nama channel
  if (/vevo/i.test(normalized)) {
    return sanitizeArtistName(normalized.replace(/vevo/i, ""));
  }

  return null;
}

export function findFairPosition(songs: BoxSong[], newUserId: string): number {
  // for (let i = 0; i < songs.length; i++) {
  //   const currentSong = songs[i];
  //   const nextSong = songs[i + 1];

  //   if (!nextSong) {
  //     return currentSong.position + 1;
  //   }

  //   if (currentSong.userId === newUserId) {
  //     continue;
  //   }

  //   if (
  //     currentSong.userId === nextSong.userId &&
  //     currentSong.userId !== newUserId
  //   ) {
  //     return currentSong.position + 1;
  //   }

  //   if (
  //     currentSong.userId !== nextSong.userId &&
  //     currentSong.userId !== newUserId &&
  //     nextSong.userId !== newUserId
  //   ) {
  //     return nextSong.position;
  //   }
  // }

  return songs[songs.length - 1].position + 1;
}

export function toPlayerMusic(lists: ListSong[]): PlayerSongType[] {
  return lists.map((list) => ({
    id: list.id,
    title: list.title,
    duration: list.duration,
    status: list.status,
    thumbnailUrl: list.thumbnailUrl,
    youtubeId: list.youtubeId,
    youtubeUrl: list.youtubeUrl,
    artist: list.artist,
  }));
}

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatBoxSongStatus = (status: BoxSongStatus) => {
  switch (status) {
    case "PLAYED":
      return "Played";
    case "PLAYING":
      return "Playing";
    case "QUEUED":
      return "Queued";
  }
};
