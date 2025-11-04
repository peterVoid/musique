"use server";

import { ActionResponse } from "@/config/types";
import { SongData } from "@/context/musique-context";
import prisma from "@/lib/prisma";
import { BoxSongStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createSong(songData: SongData): Promise<ActionResponse> {
  try {
    const createdSong = await prisma.song.create({
      data: {
        title: songData.title,
        youtubeId: songData.youtubeId,
        youtubeUrl: songData.youtubeUrl,
        duration: songData.duration,
        artist: songData.artist,
        thumbnailUrl: songData.thumbnailUrl,
      },
    });

    return {
      success: true,
      message: "Successfully added song",
      data: createdSong,
    };
  } catch (error) {
    console.error("Failed to creating song", error);
    return {
      success: false,
      message: "Failed to creating song. Please try again",
    };
  }
}

export async function updateBoxSongStatus(
  id: string,
  newStatus: BoxSongStatus
): Promise<ActionResponse> {
  try {
    const boxSong = await prisma.boxSong.findFirst({
      where: { id },
      include: {
        box: true,
      },
    });

    if (!boxSong) {
      return { success: false, message: "Box song not found" };
    }

    await prisma.boxSong.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });

    return { success: true, message: "Successfully updating box song status" };
  } catch (error) {
    console.error("Failed to updating box song", error);
    return {
      success: false,
      message: "Failed to upadting box song. Please try again",
    };
  }
}
