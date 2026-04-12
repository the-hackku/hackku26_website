// app/announcements/page.tsx
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { publishedAt: "desc" }
  });
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>

      <div className="space-y-4">
        {announcements.length === 0 && <p>No announcements yet. Check back again later!</p>}

        {announcements.map((a) => {
          const authorName = a.authorName;
          const pubStr = format(new Date(a.publishedAt), "PPP p");
          const dateStr = format(new Date(a.updatedAt), "PPP p");

          return (
            <article key={a.id} className="p-4 border rounded-md shadow-md">
              <header className="flex-col items-center justify-start space-x-4 mb-3">
                <div>
                  <div className="text-lg">{authorName}</div>
                </div>
                <div>
                    <span className="italic text-sm text-muted-foreground">Published: <time>{pubStr}</time></span>
                    <br/>
                    <span className="italic text-sm text-muted-foreground">Updated: <time>{dateStr}</time></span>
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