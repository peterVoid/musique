import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const existingBox = await prisma.box.findFirst({
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

    if (!existingBox) {
      return NextResponse.json({ error: "Box not found" }, { status: 404 });
    }

    return NextResponse.json({ data: existingBox }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/boxes/[slug] error`, error);
    const err = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
