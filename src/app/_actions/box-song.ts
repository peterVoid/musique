"use server";

import { ActionResponse } from "@/config/types";
import prisma from "@/lib/prisma";
import { findFairPosition } from "@/lib/utils";
import { BoxSong } from "@prisma/client";

export async function createBoxSong(
  boxSongData: Pick<BoxSong, "boxId" | "songId" | "status" | "userId">
): Promise<ActionResponse> {
  try {
    const { boxId, songId, status, userId } = boxSongData;

    const box = await prisma.box.findFirst({
      where: { id: boxId },
    });

    if (!box) {
      return { success: false, message: "Box not found" };
    }

    const song = await prisma.song.findFirst({
      where: {
        id: songId,
      },
    });

    if (!song) {
      return { success: false, message: "Song not found" };
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let newPosition = 1;

    const boxSongDataDB = await prisma.boxSong.findMany({
      where: { boxId: box.id },
      orderBy: { position: "asc" },
    });

    if (boxSongDataDB.length === 0) {
      newPosition = 1;
    } else {
      newPosition = findFairPosition(boxSongDataDB, userId);
    }

    await prisma.boxSong.updateMany({
      where: {
        boxId: box.id,
        position: {
          gte: newPosition,
        },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    });

    const createdBoxSong = await prisma.boxSong.create({
      data: {
        userId: user.id,
        boxId: box.id,
        songId: song.id,
        position: newPosition,
        status,
      },
    });

    return { success: true, message: "", data: createdBoxSong };
  } catch (error) {
    console.error("Failed to creating box song", error);
    return {
      success: false,
      message: "Failed to creating box song. Please try again",
    };
  }
}

export async function updateBoxSongPosition(
  id: string,
  position: number
): Promise<ActionResponse> {
  try {
    const currentBoxSong = await prisma.boxSong.findFirst({
      where: { id },
    });

    if (!currentBoxSong) {
      return { success: false, message: "Box song not found" };
    }

    const minMax = await prisma.boxSong.aggregate({
      where: { boxId: currentBoxSong.boxId },
      _min: { position: true },
      _max: { position: true },
    });

    const minPosition = minMax._min.position ?? 1;
    const maxPosition = minMax._max.position ?? 1;
    const newPosition = Math.max(minPosition, Math.min(maxPosition, position));

    if (newPosition < currentBoxSong.position) {
      await prisma.$executeRaw`
      UPDATE "box_songs"
      SET "position" = "position" + 1
      WHERE "box_id" = ${currentBoxSong.boxId}
      AND "position" >= ${newPosition}
      AND "position" < ${currentBoxSong.position}
      `;
    } else if (newPosition > currentBoxSong.position) {
      await prisma.$executeRaw`
      UPDATE "box_songs"
      SET "position" = "position" - 1
      WHERE "box_id" = ${currentBoxSong.boxId}
      AND "position" <= ${newPosition}
      AND "position" > ${currentBoxSong.position}
      `;
    }

    const updatedBoxSongs = await prisma.boxSong.update({
      where: { id: currentBoxSong.id },
      data: {
        position: newPosition,
      },
    });

    return {
      success: true,
      message: "Successfully reordering songs",
      data: updatedBoxSongs,
    };
  } catch (error) {
    console.error("Failed to creating box song", error);
    return {
      success: false,
      message: "Failed to creating box song. Please try again",
    };
  }
}
