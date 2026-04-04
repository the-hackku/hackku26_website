"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/middlewares/isAdmin";

export type InfoPageData = {
  id: string;
  title: string;
  content: string;
  titleImageUrl: string | null;
  logoUrl: string | null;
  updatedAt: Date;
};

export async function getInfoPage(): Promise<InfoPageData> {
  const page = await prisma.infoPageContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  return page;
}

export async function updateInfoPage(data: {
  title?: string;
  content?: string;
  titleImageUrl?: string | null;
  logoUrl?: string | null;
}): Promise<InfoPageData> {
  await isAdmin();

  const page = await prisma.infoPageContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  return page;
}
