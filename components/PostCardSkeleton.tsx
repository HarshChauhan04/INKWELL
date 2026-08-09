export default function PostCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border/30 bg-card p-5 pl-6 flex flex-col gap-3">
      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-full bg-primary/8" />
        <div className="h-5 w-10 rounded-full bg-muted/60" />
        <div className="ml-auto h-4 w-12 rounded bg-muted/40" />
      </div>
      {/* Title */}
      <div className="h-6 w-3/4 rounded-lg bg-muted/60" />
      <div className="h-5 w-1/2 rounded-lg bg-muted/40" />
      {/* Excerpt */}
      <div className="space-y-2 mt-1">
        <div className="h-4 w-full rounded bg-muted/40" />
        <div className="h-4 w-5/6 rounded bg-muted/30" />
        <div className="h-4 w-4/6 rounded bg-muted/20" />
      </div>
      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-border/30 pt-3 mt-1">
        <div className="h-8 w-8 rounded-full bg-primary/8 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-24 rounded bg-muted/50" />
          <div className="h-3 w-16 rounded bg-muted/30" />
        </div>
        <div className="ml-auto h-8 w-16 rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}
