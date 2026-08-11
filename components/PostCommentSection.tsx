"use client";

import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import mermaid from "mermaid";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  ChevronUpIcon,
  LoaderCircleIcon,
  SendIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  FullscreenIcon,
  GitBranchIcon,
  MousePointerClickIcon,
} from "lucide-react";
import { postComment } from "@/actions/post.actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import CommentItem from "./CommentItem";
import { ExtendedPost, Comment, CommentWithChildren } from "@/utils/types";
import GoogleButton from "./GoogleButton";

export default function PostCommentSection({ post }: { post: ExtendedPost }) {
  const { data: session } = useSession();
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [postingComment, setPostingComment] = useState<boolean>(false);
  const [showMermaidTree, setShowMermaidTree] = useState<boolean>(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  // Pan/Zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const treeRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  // Set initial comments
  useEffect(() => {
    setAllComments(post.comments || []);
  }, [post.comments]);

  // Build comment tree
  const comments = useMemo(() => {
    if (!allComments || allComments.length === 0) return [];
    const rootComments: CommentWithChildren[] = [];

    function makeCommentTree(comment: Comment): CommentWithChildren {
      const commentTree: CommentWithChildren = { ...comment, children: [] };
      const replies = allComments.filter((c) => c.parentId === comment.id);
      replies.forEach((reply) => {
        commentTree.children.push(makeCommentTree(reply));
      });
      return commentTree;
    }

    allComments.forEach((comment) => {
      if (!comment.parentId) rootComments.push(makeCommentTree(comment));
    });
    return rootComments;
  }, [allComments]);

  // Generate Mermaid chart
  const postTitle = post.title;
  const generateMermaidChart = useMemo(() => {
    if (!allComments || allComments.length === 0) {
      return `flowchart TD\n  A["💬 No comments yet"]\n  classDef default fill:#1e1e2e,stroke:#6c6f93,stroke-width:2px,color:#cdd6f4`;
    }

    const rootComments: CommentWithChildren[] = [];
    function makeCommentTree(comment: Comment): CommentWithChildren {
      const commentTree: CommentWithChildren = { ...comment, children: [] };
      const replies = allComments.filter((c) => c.parentId === comment.id);
      replies.forEach((reply) => {
        commentTree.children.push(makeCommentTree(reply));
      });
      return commentTree;
    }
    allComments.forEach((comment) => {
      if (!comment.parentId) rootComments.push(makeCommentTree(comment));
    });

    // Sanitize node IDs for Mermaid (must be alphanumeric)
    const safeId = (id: string) => `N${id.replace(/[^a-zA-Z0-9]/g, "_")}`;

    let chartCode = "flowchart TD\n";
    const safeTitle = (postTitle ?? "Post")
      .replace(/["\[\]<>]/g, "")
      .slice(0, 35);
    chartCode += `  POST["📝 ${safeTitle}"]\n`;

    const processedNodes = new Set<string>();
    const processNode = (comment: CommentWithChildren, parentSafeId?: string) => {
      const nid = safeId(comment.id);
      if (processedNodes.has(nid)) return;
      processedNodes.add(nid);

      const name = (comment.author.name ?? "User")
        .replace(/["\[\]<>]/g, "")
        .slice(0, 20);
      const content = comment.content
        .replace(/["\[\]<>]/g, "")
        .replace(/\n/g, " ")
        .slice(0, 35);

      const label = `"👤 ${name}\\n${content}${comment.content.length > 35 ? "…" : ""}"`;

      if (parentSafeId) {
        chartCode += `  ${parentSafeId} --> ${nid}[${label}]\n`;
      } else {
        chartCode += `  POST --> ${nid}[${label}]\n`;
      }
      comment.children?.forEach((child) => processNode(child, nid));
    };

    rootComments.forEach((comment) => processNode(comment));

    // Dark-mode aware styling
    chartCode += `
  classDef postNode fill:#7c3aed,stroke:#a78bfa,stroke-width:3px,color:#fff,font-weight:bold
  classDef rootNode fill:#1d4ed8,stroke:#60a5fa,stroke-width:2px,color:#fff
  classDef replyNode fill:#065f46,stroke:#34d399,stroke-width:2px,color:#fff
  class POST postNode\n`;

    rootComments.forEach((comment) => {
      chartCode += `  class ${safeId(comment.id)} rootNode\n`;
      const applyReply = (c: CommentWithChildren) => {
        c.children?.forEach((child) => {
          chartCode += `  class ${safeId(child.id)} replyNode\n`;
          applyReply(child);
        });
      };
      applyReply(comment);
    });

    return chartCode;
  }, [allComments, postTitle, postAuthorName]);

  // Render Mermaid SVG
  useEffect(() => {
    if (!showMermaidTree || !treeRef.current) return;

    const renderMermaid = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: 13,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: false,
            curve: "basis",
            padding: 20,
          },
        });

        if (treeRef.current) treeRef.current.innerHTML = "";

        const elementId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(elementId, generateMermaidChart);
        if (!treeRef.current) return;

        treeRef.current.innerHTML = svg;

        // Reset pan/zoom
        setScale(1);
        setPan({ x: 0, y: 0 });

        // --- Click-to-highlight: attach listeners to all SVG nodes ---
        const svgEl = treeRef.current.querySelector("svg");
        if (!svgEl) return;

        // Make SVG fill the wrapper instead of being fixed-size
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";

        // Map safe IDs back to real comment IDs
        const safeId = (id: string) => `N${id.replace(/[^a-zA-Z0-9]/g, "_")}`;
        const safeToReal: Record<string, string> = {};
        allComments.forEach((c) => {
          safeToReal[safeId(c.id)] = c.id;
        });

        // Mermaid renders nodes as <g class="node ..."> with id like "flowchart-NODE_ID-N"
        const nodeGroups = svgEl.querySelectorAll("g.node");
        nodeGroups.forEach((g) => {
          const rawId = g.id; // e.g. "flowchart-N_someId-1"
          const parts = rawId.split("-");
          // Strip the numeric suffix and "flowchart" prefix
          const nid = parts.slice(1, parts.length - 1).join("-");
          const realId = safeToReal[nid];
          if (!realId) return;

          (g as HTMLElement).style.cursor = "pointer";

          // Hover effect
          g.addEventListener("mouseenter", () => {
            (g as HTMLElement).style.opacity = "0.8";
            (g as HTMLElement).style.filter = "drop-shadow(0 0 8px #a78bfa)";
          });
          g.addEventListener("mouseleave", () => {
            (g as HTMLElement).style.opacity = "1";
            (g as HTMLElement).style.filter = "";
          });

          // Click: close modal, expand thread, scroll + highlight
          g.addEventListener("click", () => {
            setShowMermaidTree(false);
            setHighlightedId(realId);

            // Expand the thread so the comment is visible
            setExpandedComments((prev) => {
              const next = new Set(prev);
              // Expand all ancestors
              let current = allComments.find((c) => c.id === realId);
              while (current?.parentId) {
                next.add(current.parentId);
                current = allComments.find((c) => c.id === current!.parentId);
              }
              next.add(realId);
              return next;
            });

            // Wait for DOM update then scroll
            setTimeout(() => {
              const el = document.querySelector(`[data-comment-id="${realId}"]`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              // Clear highlight after animation
              setTimeout(() => setHighlightedId(null), 2500);
            }, 150);
          });
        });
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        if (treeRef.current) {
          treeRef.current.innerHTML = `<div class="text-red-400 p-4 text-sm">Error rendering diagram. Please try again.</div>`;
        }
      }
    };

    renderMermaid();
  }, [generateMermaidChart, showMermaidTree, allComments]);

  // ── Pan/Zoom handlers ──────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(4, Math.max(0.25, s - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const zoomIn = () => setScale((s) => Math.min(4, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.25, s - 0.25));
  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  // ── Comment handlers ───────────────────────────────────────────────────────
  const handlePostComment = useCallback(async () => {
    try {
      if (!newComment.trim()) { toast.error("No content to post."); return; }
      setPostingComment(true);
      await postComment({ postId: post.id, content: newComment });
      setNewComment("");
      setPostingComment(false);
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment. Please try again.");
      setPostingComment(false);
    }
  }, [newComment, post.id]);

  const collapseAll = useCallback(() => setExpandedComments(new Set()), []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <span className="text-2xl font-bold px-2">
          Comments ({allComments.length})
        </span>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showMermaidTree ? "default" : "outline"}
            onClick={() => setShowMermaidTree(!showMermaidTree)}
            className="min-w-[140px] text-xs md:text-sm gap-1.5"
          >
            <GitBranchIcon className="w-4 h-4" />
            {showMermaidTree ? "Hide Tree" : "Comment Tree"}
          </Button>
          <Button
            variant={"outline"}
            onClick={collapseAll}
            disabled={!expandedComments.size}
            className="min-w-[120px] text-xs md:text-sm"
          >
            <ChevronUpIcon className="w-4 h-4 mr-1" />
            Collapse all
          </Button>
        </div>
      </div>

      {/* Comment input */}
      {!session ? (
        <div className="w-full max-w-2xl mx-auto p-6 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center gap-3 bg-card text-card-foreground">
          <p className="text-muted-foreground text-sm">
            You must be signed in to join the conversation.
          </p>
          <GoogleButton />
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full min-h-[80px] md:min-h-[100px] resize-none"
          />
          <Button
            disabled={!newComment.trim() || postingComment}
            className="mt-2 ml-auto flex text-xs md:text-sm"
            onClick={handlePostComment}
          >
            {postingComment ? (
              <LoaderCircleIcon className="animate-spin w-4 h-4 mr-1" />
            ) : (
              <SendIcon className="w-4 h-4 mr-1" />
            )}
            {postingComment ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      )}

      {/* ── Mermaid Diagram Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showMermaidTree && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-[96vw] h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <GitBranchIcon className="w-5 h-5 text-violet-400" />
                  <span className="font-semibold text-white text-sm md:text-base">
                    Comment Tree Diagram
                  </span>
                  <span className="text-xs text-zinc-500 hidden md:inline">
                    — click any node to jump to that comment
                  </span>
                </div>

                {/* Zoom controls + close */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1 py-0.5">
                    <button
                      onClick={zoomOut}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded"
                      title="Zoom out"
                    >
                      <ZoomOutIcon className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-zinc-400 w-10 text-center select-none">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded"
                      title="Zoom in"
                    >
                      <ZoomInIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetView}
                      className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded"
                      title="Reset view"
                    >
                      <FullscreenIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs h-8"
                    onClick={() => setShowMermaidTree(false)}
                  >
                    <XIcon className="w-3.5 h-3.5 mr-1" />
                    Close
                  </Button>
                </div>
              </div>

              {/* Hint bar */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border-b border-violet-500/20 shrink-0">
                <MousePointerClickIcon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="text-xs text-violet-300">
                  Click a node to jump to that comment · Scroll to zoom · Drag to pan
                </span>
              </div>

              {/* Pan/Zoom canvas */}
              <div
                ref={svgWrapperRef}
                className="flex-1 overflow-hidden relative select-none"
                style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  ref={treeRef}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transformOrigin: "center center",
                    transition: isDragging.current ? "none" : "transform 0.1s ease",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment list */}
      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
        <AnimatePresence>
          {comments.map((comment: CommentWithChildren) => {
            const hasChildren = comment.children && comment.children.length > 0;
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                hasChildren={hasChildren}
                post={post}
                expandedComments={expandedComments}
                setExpandedComments={setExpandedComments}
                highlighted={highlightedId === comment.id}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
