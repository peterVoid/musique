import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            id: identifier,
          },
          {
            fingerPrint: identifier,
          },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/users/[id] error`, error);

    const err = error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json({ error: err }, { status: 500 });
  }
}
