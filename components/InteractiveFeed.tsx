"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { getPaginatedPosts } from "@/actions/post.actions";
import PostCard from "@/components/PostCard";
import PostCardSkeleton from "@/components/PostCardSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoaderCircleIcon, SearchIcon, TagIcon, XIcon } from "lucide-react";
import { Post, User } from "@prisma/client";

type ExtendedPost = Post & { author: User };

interface InteractiveFeedProps {
  initialPosts: ExtendedPost[];
  initialCursor: string | null;
  session?: any;
}

export default function InteractiveFeed({
  initialPosts,
  initialCursor,
}: InteractiveFeedProps) {
  const [posts, setPosts] = useState<ExtendedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearching] = useTransition();

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Collect all unique tags from current posts
  const allTags = Array.from(
    new Set(posts.flatMap((p) => (p as any).tags as string[] ?? []))
  );

  const handleSearch = useCallback(
    (query: string, tag: string | null) => {
      startSearching(async () => {
        const { posts: fresh, nextCursor } = await getPaginatedPosts({
          searchQuery: query,
          tag: tag ?? undefined,
          cursor: null,
        });
        setPosts(fresh as ExtendedPost[]);
        setCursor(nextCursor);
      });
    },
    []
  );

  // Debounced search on query change
  const onSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      handleSearch(value, activeTag);
    }, 300);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const onTagClick = (tag: string) => {
    const next = activeTag === tag ? null : tag;
    setActiveTag(next);
    handleSearch(searchQuery, next);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTag(null);
    handleSearch("", null);
  };

  const loadMore = () => {
    if (!cursor) return;
    startTransition(async () => {
      const { posts: more, nextCursor } = await getPaginatedPosts({
        cursor,
        searchQuery,
        tag: activeTag ?? undefined,
      });
      setPosts((prev) => [...prev, ...(more as ExtendedPost[])]);
      setCursor(nextCursor);
    });
  };

  const hasFilters = searchQuery.trim() || activeTag;

  return (
    <div className="flex flex-col gap-5">
      {/* Search bar */}
      <div className="relative w-full max-w-xl">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts by title or content..."
          className="w-full pl-10 pr-10 py-2.5 border border-border/50 rounded-xl bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <TagIcon className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-200 cursor-pointer ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-primary/5 text-muted-foreground border-border/50 hover:text-primary hover:border-primary/30 hover:bg-primary/10"
              }`}
            >
              #{tag}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground/60 hover:text-primary flex items-center gap-1 ml-2 transition-colors duration-200 cursor-pointer"
            >
              <XIcon className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Skeleton loaders while searching */}
      {isSearching && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Post list */}
      {!isSearching && (
        <>
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground mx-auto text-center text-balance py-12"
            >
              {hasFilters
                ? "No posts found matching your search."
                : "No posts available. Create one to get started!"}
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Load More button */}
          {cursor && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isPending}
                className="min-w-[160px] rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
              >
                {isPending ? (
                  <>
                    <LoaderCircleIcon className="animate-spin w-4 h-4 mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
