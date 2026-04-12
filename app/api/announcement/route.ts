// app/api/announcements/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.ANNOUNCEMENT_SECRET;

export async function POST(request: Request) {
  const headerSecret = request.headers.get("x-announcement-secret") || (() => {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ") ? auth.slice(7) : null;
  })();

  if (!SECRET || headerSecret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, publishedAt, authorId } = body;
  let { authorName } = body;
  if (!content) {
    return NextResponse.json({ error: "Missing required fields: body" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
  }

  try {
    const account = await prisma.account.findFirst({
      where: { providerAccountId: authorId }
    });
    if (account) {
      const info = await prisma.participantInfo.findFirst({
        where: { userId: account.userId }
      });
      authorName = info?.firstName + " " + info?.lastName.substring(0, 1) || authorName;
    }
    const created = await prisma.announcement.create({
      data: {
        content: content,
        authorId: authorId,
        authorName: authorName,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    });
    revalidatePath("/announcements");

    return NextResponse.json({
      ...created,
      publishedAt: created.publishedAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("POST /api/announcements error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const headerSecret = request.headers.get("x-announcement-secret") || (() => {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ") ? auth.slice(7) : null;
  })();

  if (!SECRET || headerSecret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, content } = body;
  if (!content) {
    return NextResponse.json({ error: "Missing required fields: content" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
  }

  try {
    const updated = await prisma.announcement.update({
      where: { id: id },
      data: {
        content: content,
      },
    });
    revalidatePath("/announcements");

    return NextResponse.json({
      ...updated,
      publishedAt: updated.publishedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("PATCH /api/announcements error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const headerSecret = request.headers.get("x-announcement-secret") || (() => {
    const auth = request.headers.get("authorization") || "";
    return auth.startsWith("Bearer ") ? auth.slice(7) : null;
  })();

  if (!SECRET || headerSecret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing required fields: id" }, { status: 400 });
  }

  try {
    await prisma.announcement.delete({
      where: { id: id },
    });
    revalidatePath("/announcements");
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/announcements error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}