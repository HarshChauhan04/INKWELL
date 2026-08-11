import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistance as timeFormatDistance } from "date-fns";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { postComment } from "@/actions/post.actions";
import { motion } from "framer-motion";
import Link from "next/link";
import { UpdateComment } from "./UpdateComment";
import DeleteCommentButton from "./DeleteCommentbutton";
import { Button } from "./ui/button";
import {
  ChevronUpIcon,
  LoaderCircleIcon,
  ReplyIcon,
  SendIcon,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { CommentWithChildren } from "@/utils/types";
import { useSession } from "next-auth/react";

export default function CommentItem({
  comment,
  depth = 0,
  hasChildren = false,
  post,
  expandedComments,
  setExpandedComments,
  highlighted = false,
}: {
  comment: CommentWithChildren;
  depth?: number;
  hasChildren?: boolean;
  post?: any;
  expandedComments: Set<string>;
  setExpandedComments: React.Dispatch<React.SetStateAction<Set<string>>>;
  highlighted?: boolean;
}) {
  // Read session directly so the Reply button is always in sync with auth state
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session;

  const allowActions =
    comment.author.email === session?.user?.email ||
    post?.author?.email === session?.user?.email;

  const [replying, setReplying] = useState<boolean>(false);
  const [postingReply, startPostingReply] = useTransition();
  const [replyContent, setReplyContent] = useState<string>("");
  const expanded = expandedComments.has(comment.id);

  function expand() {
    setExpandedComments((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.add(comment.id);
      return newSet;
    });
  }
  function collapse() {
    setExpandedComments((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.delete(comment.id);
      return newSet;
    });
  }
  function toggleCollapse() {
    if (expandedComments.has(comment.id)) {
      collapse();
    } else {
      expand();
    }
  }

  const handlePostReply = async () => {
    startPostingReply(async () => {
      try {
        if (!replyContent.trim()) {
          toast.error("No content to post.");
          return;
        }
        await postComment({
          postId: post.id,
          content: replyContent,
          parentId: comment.id,
        });
        setReplyContent("");
        setReplying(false);
      } catch (error) {
        console.error("Error posting comment:", error);
        toast.error("Failed to post comment. Please try again.");
      }
    });
  };

  return (
    <motion.div
      data-comment-id={comment.id}
      className={`${depth > 0 ? "ml-8 border-l border-border pl-4" : ""}`}
      initial={{ height: 0, opacity: 0, y: -20 }}
      animate={{ height: "auto", opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`bg-background rounded-lg p-4 shadow-sm border mb-3 transition-all duration-500 ${
          highlighted
            ? "border-violet-500 ring-2 ring-violet-500/40 shadow-violet-500/20 shadow-lg"
            : "border-border"
        }`}
      >
        <div className="flex items-start space-x-3">
          {/* user avatar */}
          <div className="flex-shrink-0">
            <Link href={`/profiles/${comment.author.id}`}>
              <Avatar>
                <AvatarImage
                  src={comment.author.image ?? undefined}
                  alt={comment.author.name ?? "User Avatar"}
                />
                <AvatarFallback>
                  {comment?.author?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          {/* user name and comment time */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link
                href={`/profiles/${comment.author.id}`}
                className="font-medium text-foreground text-md"
              >
                {comment.author.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {timeFormatDistance(new Date(comment.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
              {allowActions && (
                <div className="flex items-center space-x-2 ml-auto">
                  <UpdateComment
                    commentId={comment.id}
                    content={comment.content}
                  />
                  <DeleteCommentButton commentId={comment.id} />
                </div>
              )}
            </div>

            {/* content */}
            <p className="text-muted-foreground">{comment.content}</p>

            {/* reply and expand buttons */}
            <div className="flex items-center space-x-4 ml-auto w-max">
              {isLoggedIn && (
                <Button
                  onClick={() => {
                    setReplying(true);
                    expand();
                  }}
                  variant={"ghost"}
                >
                  <ReplyIcon />
                  <span>Reply</span>
                </Button>
              )}

              <Button
                onClick={toggleCollapse}
                disabled={!hasChildren}
                variant={"ghost"}
              >
                <ChevronUpIcon
                  className={`${
                    expanded ? "rotate-0" : "rotate-180"
                  } transition-all duration-200`}
                />
                <span>
                  {`${expanded ? "Hide Replies" : "Show Replies"} (${
                    comment.children.length
                  })`}
                </span>
              </Button>
            </div>
          </div>
        </div>
        {/* Reply Form */}
        {replying && (
          <div className="flex-1 py-2">
            <Textarea
              disabled={postingReply}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.author.name}...`}
            />
            <div className="flex space-x-2 flex-row justify-end mt-2">
              <Button
                onClick={handlePostReply}
                disabled={!replyContent.trim() || postingReply}
              >
                {postingReply ? (
                  <>
                    <LoaderCircleIcon className="animate-spin" />
                    <span>Replying ...</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4" />
                    <span>Reply</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setReplying(false);
                  setReplyContent("");
                }}
                variant={"destructive"}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Comments */}
      {hasChildren && expanded && (
        <div className="mt-2">
          {comment.children.map((child: CommentWithChildren) => {
            const childHasChildren =
              child.children && child.children.length > 0;
            return (
              <CommentItem
                key={child.id}
                comment={child}
                depth={depth + 1}
                hasChildren={childHasChildren}
                post={post}
                expandedComments={expandedComments}
                setExpandedComments={setExpandedComments}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
