import { DEFAULT_LIMIT } from "@/config/constants";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const box = await prisma.box.findFirst({
      where: {
        OR: [
          {
            id: identifier,
          },
          {
            slug: identifier,
          },
        ],
      },
    });

    if (!box) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }

    const boxSongs = await prisma.boxSong.findMany({
      where: {
        box: {
          slug: identifier,
        },
      },
      orderBy: {
        position: "asc",
      },
      take: DEFAULT_LIMIT,
    });

    const boxSongsCount =
      (await prisma.boxSong.count({
        where: {
          boxId: box.id,
        },
      })) || 0;

    return NextResponse.json(
      { data: boxSongs, pagination: { totalCount: boxSongsCount } },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET /api/boxes/[id]/songs error`, error);
    const err = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
