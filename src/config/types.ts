import { BoxSongStatus, User } from "@prisma/client";

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface YoutubeSearchResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  url: string;
}

export interface ListSong {
  id: string;
  title: string;
  position: number;
  artist?: string | null;
  youtubeId: string;
  youtubeUrl: string;
  duration: string;
  status: BoxSongStatus;
  user: User;
  thumbnailUrl?: string;
}

export interface PlayerSongType {
  id: string;
  title: string;
  artist?: string | null;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  duration: string;
  status: BoxSongStatus;
}
