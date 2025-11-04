import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Please provide the IDS" },
        { status: 400 }
      );
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (!ids.length) {
      return NextResponse.json({ error: "Ids not provided" }, { status: 400 });
    }

    const songs = await prisma.song.findMany({
      where: {
        OR: [
          {
            id: {
              in: ids,
            },
          },
          {
            youtubeId: {
              in: ids,
            },
          },
        ],
      },
    });

    if (songs.length === 0) {
      return NextResponse.json(
        { error: "Failed to find the songs" },
        { status: 400 }
      );
    }

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error(`GET /api/songs/by-ids/ error`, error);

    const err = error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json({ error: err }, { status: 500 });
  }
}
