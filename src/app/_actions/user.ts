"use server";

import { ActionResponse } from "@/config/types";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export async function createUser(
  data: Pick<User, "fingerPrint" | "username">
): Promise<ActionResponse> {
  try {
    const { fingerPrint, username } = data;

    const existingUser = await prisma.user.findFirst({
      where: { fingerPrint },
    });

    if (existingUser) {
      return { success: false, message: "User already exist" };
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        fingerPrint,
      },
    });

    return {
      success: true,
      message: "Successfully created user",
      data: newUser,
    };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateUser(
  fingerPrint: string,
  newUsername: string
): Promise<ActionResponse> {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        fingerPrint,
      },
    });

    if (!existingUser) {
      return { success: false, message: "User not found" };
    }

    const updatedUser = await prisma.user.update({
      data: {
        username: newUsername,
      },
      where: { id: existingUser.id },
    });

    return {
      success: true,
      message: "Successfully updated user",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, message: "Something went wrong" };
  }
}
