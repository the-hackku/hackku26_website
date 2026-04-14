// app/announcements/page.tsx
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AutoRefresh from "./AutoRefresh";
import Image from "next/image";

async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { publishedAt: "desc" }
  });
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="container md:mx-auto px-3 py-6">
      <AutoRefresh />
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>

      <div className="space-y-4">
        {announcements.length === 0 && <p>No announcements yet. Check back again later!</p>}

        {announcements.map((a) => {
          const authorColor = a.authorColor;
          const authorName = a.authorName;
          const authorImageUrl = a.authorImageUrl;
          const pubDate = new Date(a.publishedAt);
          const upDate = new Date(a.updatedAt);

          return (
            <article key={a.id} className="p-4 border rounded-md shadow-md">
              <header className="flex items-center justify-between mb-3">
                <div className="flex space-x-2 items-center">
                  {authorImageUrl && 
                    <Image 
                      className="rounded-full"
                      alt={`${authorName}-pfp`}
                      src={authorImageUrl} 
                      width={35}
                      height={35}
                    />
                  }
                  <div 
                    style={{ color: authorColor ?? "" }}
                    className="text-lg font-bold"
                  >
                    {authorName}
                  </div>
                </div>
                <div className="hidden md:block italic text-sm text-muted-foreground text-right float-right">
                  {pubDate === upDate ? (
                    <span>Published: <time>{format(pubDate, "PPP p")}</time></span>
                  ) : (
                    <span>Updated: <time>{format(upDate, "PPP p")}</time></span>
                  )}
                </div>
              </header>
              <hr />
              <div className="mt-3 prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{a.content}</ReactMarkdown>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
