"use client";

import React, { useState, useCallback, useTransition } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { updateInfoPage, type InfoPageData } from "@/app/actions/infoPage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── TOC extraction ────────────────────────────────────────────────────────────

interface TocEntry {
  level: number;
  text: string;
  id: string;
}

function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split("\n");
  const entries: TocEntry[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      entries.push({ level, text, id });
    }
  }
  return entries;
}

// ── Image uploader ────────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
  const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
    method: "POST",
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialData: InfoPageData;
  isAdmin: boolean;
}

export default function InfoPageView({ initialData, isAdmin }: Props) {
  const [data, setData] = useState(initialData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const toc = extractToc(data.content);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const updated = await updateInfoPage({
          title: draft.title,
          content: draft.content,
          titleImageUrl: draft.titleImageUrl,
          logoUrl: draft.logoUrl,
        });
        setData(updated);
        setEditing(false);
        toast.success("Page saved");
      } catch {
        toast.error("Failed to save page");
      }
    });
  };

  const handleImageUpload = async (
    field: "titleImageUrl" | "logoUrl",
    file: File
  ) => {
    try {
      const url = await uploadImage(file);
      setDraft((d) => ({ ...d, [field]: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const tocNav = toc.length > 0 && (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        On this page
      </p>
      <nav className="space-y-1">
        {toc.map((entry) => (
          <button
            key={entry.id}
            onClick={() => scrollTo(entry.id)}
            className={`block w-full text-left underline text-sm py-1 transition-colors hover:bg-gray-200 text-gray-600 ${
              entry.level === 1 ? "font-semibold" : ""
            }`}
            style={{ paddingLeft: `${(entry.level - 1) * 12}px` }}
          >
            {entry.text}
          </button>
        ))}
      </nav>
    </>
  );

  return (
    <div>
      {/* ── Full-width banner (view mode only) ── */}
      {!editing && data.titleImageUrl && (
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={data.titleImageUrl}
            alt="Page cover"
            fill
            className="object-cover"
            priority
          />
          {/* dark gradient so logo sits clearly */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {data.logoUrl && (
            <div className="absolute bottom-4 left-4 md:left-8 flex items-center gap-3">
              <div className="relative w-20 h-20 shrink-0">
                <Image
                  src={data.logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      )}

    <div className="flex gap-8 max-w-7xl mx-auto px-4 py-8">
      {/* ── Sidebar TOC (desktop) ── */}
      {!editing && toc.length > 0 && (
        <aside className="hidden lg:block w-56 shrink-0">
          {tocNav}
        </aside>
      )}

      <main className="flex-1 min-w-0">
        {/* Admin toolbar */}
        {isAdmin && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-xs text-amber-700 font-medium flex-1">
              Admin editing mode
            </span>
            {editing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraft(data);
                    setEditing(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setEditing(true)}>
                Edit page
              </Button>
            )}
          </div>
        )}

        {/* ── Inline TOC (mobile only) ── */}
        {!editing && toc.length > 0 && (
          <div className="lg:hidden mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {tocNav}
          </div>
        )}

        {editing ? (
          /* ── Edit mode ── */
          <div className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="page-title">Page title</Label>
              <Input
                id="page-title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 text-xl font-bold"
              />
            </div>

            {/* Logo upload */}
            <div>
              <Label>Logo Image</Label>
              <div className="flex items-center gap-4 mt-1">
                {draft.logoUrl && (
                  <div className="relative w-16 h-16">
                    <Image
                      src={draft.logoUrl}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("logoUrl", file);
                  }}
                  className="text-sm"
                />
                {draft.logoUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDraft((d) => ({ ...d, logoUrl: null }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Title image upload */}
            <div>
              <Label>Title / Banner Image</Label>
              <div className="flex items-center gap-4 mt-1">
                {draft.titleImageUrl && (
                  <div className="relative w-32 h-20">
                    <Image
                      src={draft.titleImageUrl}
                      alt="Cover"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("titleImageUrl", file);
                  }}
                  className="text-sm"
                />
                {draft.titleImageUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDraft((d) => ({ ...d, titleImageUrl: null }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Markdown editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 rounded-md border border-input p-0.5 bg-muted text-sm">
                  {(["write", "preview"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setEditorTab(tab)}
                      className={`px-3 py-1 rounded capitalize transition-colors ${
                        editorTab === tab
                          ? "bg-background shadow-sm font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-input bg-background hover:bg-accent transition-colors select-none">
                    Upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Reset so same file can be re-selected
                      e.target.value = "";
                      try {
                        const url = await uploadImage(file);
                        const snippet = `![${file.name}](${url})`;
                        const textarea = document.getElementById("page-content") as HTMLTextAreaElement | null;
                        if (textarea) {
                          const start = textarea.selectionStart ?? draft.content.length;
                          const end = textarea.selectionEnd ?? start;
                          const before = draft.content.slice(0, start);
                          const after = draft.content.slice(end);
                          const newContent = before + snippet + after;
                          setDraft((d) => ({ ...d, content: newContent }));
                          // Restore cursor after the inserted snippet
                          requestAnimationFrame(() => {
                            textarea.selectionStart = start + snippet.length;
                            textarea.selectionEnd = start + snippet.length;
                            textarea.focus();
                          });
                        } else {
                          setDraft((d) => ({ ...d, content: d.content + "\n" + snippet }));
                        }
                        toast.success("Image inserted");
                      } catch {
                        toast.error("Image upload failed");
                      }
                    }}
                  />
                </label>
              </div>
              {editorTab === "write" ? (
                <textarea
                  id="page-content"
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  rows={30}
                  className="w-full font-mono text-sm border border-input rounded-md px-3 py-2 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="# My heading&#10;&#10;Write your content here in GitHub Flavored Markdown…"
                  spellCheck={false}
                />
              ) : (
                <div className="min-h-[30rem] border border-input rounded-md px-4 py-3 prose prose-gray max-w-none">
                  {draft.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                      {draft.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground italic">Nothing to preview.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <>
            {/* Title */}
            <h1 className="text-3xl font-bold mb-8">{data.title}</h1>

            {/* Rendered markdown */}
            {data.content ? (
              <div className="prose prose-gray max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSlug]}
                  components={{
                    // Open external links in new tab
                    a: ({ href, children, ...rest }) => (
                      <a
                        href={href}
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                        {...rest}
                      >
                        {children}
                      </a>
                    ),
                    // Task list checkboxes (GFM)
                    input: ({ type, checked, ...rest }) =>
                      type === "checkbox" ? (
                        <input type="checkbox" checked={checked} readOnly className="mr-1" {...rest} />
                      ) : (
                        <input type={type} {...rest} />
                      ),
                  }}
                >
                  {data.content}
                </ReactMarkdown>
              </div>
            ) : (
              isAdmin && (
                <p className="text-gray-400 italic">
                  No content yet. Click &ldquo;Edit page&rdquo; to add content.
                </p>
              )
            )}
          </>
        )}
      </main>
    </div>
    </div>
  );
}
