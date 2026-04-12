// app/api/announcements/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.ANNOUNCEMENT_SECRET;

interface PostBody {
  content: string;
  publishedAt?: string;
  authorId?: string;
  authorName?: string;
}

interface PatchBody {
  id: string;
  content: string;
}

interface DeleteBody {
  id: string;
}

function getRequestSecret(request: Request): string | null {
  const direct = request.headers.get("x-announcement-secret");
  if (direct) return direct;

  const auth = request.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

// Date-time strings without a timezone offset are interpreted as local time by
// the ECMAScript spec, not UTC. Append "Z" when no offset is present so the
// timestamp is always treated as UTC regardless of the server's local timezone.
function parseUtcDate(dateStr: string): Date {
  const hasOffset = dateStr.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(dateStr);
  return new Date(hasOffset ? dateStr : dateStr + "Z");
}

function isAuthorized(headerSecret: string | null): boolean {
  if (!SECRET || !headerSecret) return false;
  try {
    return timingSafeEqual(Buffer.from(headerSecret), Buffer.from(SECRET));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(getRequestSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { content, publishedAt, authorId, authorName } = body;

  if (!content) {
    return NextResponse.json({ error: "Missing required fields: body" }, { status: 400 });
  }
  if (typeof content !== "string") {
    return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
  }

  // TODO: Create a lookup table for specific author ids
  try {
    const created = await prisma.announcement.create({
      data: {
        content,
        authorId: authorId ?? "",
        authorName: authorName ?? "HackKU Team",
        publishedAt: publishedAt ? parseUtcDate(publishedAt) : new Date(),
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
  if (!isAuthorized(getRequestSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
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
      where: { id },
      data: { content },
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
  if (!isAuthorized(getRequestSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DeleteBody;
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
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/announcements");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/announcements error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
