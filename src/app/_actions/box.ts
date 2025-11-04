"use server";

import { ActionResponse } from "@/config/types";
import prisma from "@/lib/prisma";

export async function createBox(
  userId: string,
  name: string
): Promise<ActionResponse> {
  try {
    if (!name) {
      return { success: false, message: "Please provide the name" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return { success: false, message: "User does not created" };
    }

    const baseSlug = name
      .toLocaleLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const similarCount = await prisma.box.count({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
    });

    const finalSlug =
      similarCount > 0 ? `${baseSlug}-${similarCount + 1}` : baseSlug;

    const createdBox = await prisma.box.create({
      data: {
        slug: finalSlug,
        name,
        user: { connect: { id: userId } },
      },
    });

    return {
      success: true,
      message: "Successfully created box",
      data: createdBox,
    };
  } catch (error) {
    console.error("Failed to creating box", error);
    return {
      success: false,
      message: "Failed to creating box. Please try again",
    };
  }
}
