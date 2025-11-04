import prisma from "@/lib/prisma";
import { findFairPosition } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, boxId, songId, status } = await req.json();

    const box = await prisma.box.findFirst({
      where: { id: boxId },
    });

    if (!box) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }

    const song = await prisma.song.findFirst({
      where: { id: songId },
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const user = await prisma.user.findFirst({
      where: { id: songId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const boxSongs = await prisma.boxSong.findMany({
      where: {
        boxId: box.id,
      },
      orderBy: {
        position: "asc",
      },
    });

    let boxSongPosition = 0;

    if (boxSongs.length === 0) {
      boxSongPosition = 1;
    } else {
      boxSongPosition = findFairPosition(boxSongs, userId);
    }

    await prisma.boxSong.updateMany({
      where: {
        boxId: box.id,
        position: {
          gte: boxSongPosition,
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
        boxId: box.id,
        songId: song.id,
        userId: user.id,
        position: boxSongPosition,
        status,
      },
    });

    return NextResponse.json(createdBoxSong, { status: 200 });
  } catch (error) {
    console.error(`GET /api/box-songs/ error`, error);
    const err = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
