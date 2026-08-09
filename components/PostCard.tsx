"use client";
import { Post } from "@prisma/client";
import { Button } from "./ui/button";
import { ExternalLink, PencilIcon, TagIcon } from "lucide-react";
import { User } from "@prisma/client";
import { formatDistance as timeFormatDistance } from "date-fns";
import DeletePostButton from "./DeletePostbutton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSession } from "next-auth/react";
import Reveal from "./animations/Reveal";
import React from "react";
import Markdown from "@/utils/markdown";

/** Strip markdown syntax and return a plain-text excerpt */
function stripMarkdown(md: string, maxLen = 180): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, (m) => m.replace(/`/g, ""))
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>|]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, maxLen)
    .concat(md.replace(/\s/g, "").length > maxLen ? "…" : "");
}

/** Rough reading time estimate */
function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

type ExtendedPost = Post & { author: User };

export default function PostCard({
  post,
  open = false,
}: {
  post: ExtendedPost;
  open?: boolean;
}) {
  const { data: session } = useSession();
  const isAuthor =
    session && session.user && post.author.email === session?.user.email;

  return (
    <Reveal>
      <article
        className={cn(
          "group relative flex flex-col gap-0 rounded-xl overflow-hidden",
          "border transition-all duration-300",
          "bg-card border-border/40",
          "hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5",
          "hover:-translate-y-[1px]"
        )}
      >
        {/* Left crimson accent bar — animated on hover */}
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-400" />

        {/* Subtle red glow overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(232,41,58,0.04) 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10 flex flex-col gap-3 p-5 pl-6">

          {/* Tags + reading time */}
          <div className="flex flex-wrap items-center gap-2">
            {(post as any).tags && (post as any).tags.length > 0 && (
              <>
                {(post as any).tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15"
                  >
                    <TagIcon className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </>
            )}
            {!open && (
              <span className="ml-auto text-[11px] text-muted-foreground font-medium">
                {readingTime(post.content)}
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className={cn(
              "font-bold leading-snug tracking-tight break-words text-foreground",
              open ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
              !open && "group-hover:text-primary transition-colors duration-200"
            )}
          >
            {post.title || "Untitled"}
          </h2>

          {/* Content excerpt / full markdown */}
          <div
            className={cn(
              "text-muted-foreground leading-relaxed",
              open && "prose dark:prose-invert max-w-none text-foreground/90"
            )}
          >
            {open ? (
              <Markdown content={post.content} />
            ) : (
              <p className="text-sm line-clamp-3">{stripMarkdown(post.content)}</p>
            )}
          </div>

          {/* Footer — author + actions */}
          <div className="flex items-center gap-3 pt-3 mt-1 border-t border-border/40">
            <Link
              href={`/profiles/${post.author.id}`}
              className="flex items-center gap-2.5 flex-1 min-w-0 group/author"
            >
              <Avatar className="size-8 border border-border/40 shrink-0">
                <AvatarImage src={post.author.image ?? undefined} alt="user avatar" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {post.author.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground/70 group-hover/author:text-primary transition-colors truncate leading-tight">
                  {post.author.name || "Anonymous"}
                  {isAuthor && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md align-middle border border-primary/15">
                      You
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {timeFormatDistance(new Date(post.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Link>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!open && (
                <Link href={`/posts/${post.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-8 text-xs gap-1",
                      "border-border/40 bg-transparent",
                      "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                      "transition-all duration-200"
                    )}
                  >
                    Read <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              )}
              {isAuthor && (
                <>
                  <Link href={`/posts/${post.id}/update`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <DeletePostButton postId={post.id} />
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
