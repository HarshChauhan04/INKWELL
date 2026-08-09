"use server";

import prisma from "@/prisma/client";
import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export const updateName = async (newName: string) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { name: newName },
  });

  revalidatePath(`/`, "layout");
  return { message: "Name updated successfully !!" };
};

export const updateAvatar = async (imageDataUrl: string) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  // Validate it's actually a valid image data URL (jpeg or png)
  if (!imageDataUrl.startsWith("data:image/")) {
    throw new Error("Invalid image format");
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { image: imageDataUrl },
  });

  revalidatePath(`/`, "layout");
  return { message: "Avatar updated successfully!" };
};

