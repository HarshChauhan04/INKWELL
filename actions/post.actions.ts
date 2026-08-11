"use server";

import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { revalidatePath } from "next/cache";


/** Revalidate all feed/post listing pages — scoped, not full-layout */
function revalidatePostPaths(postId?: string) {
  revalidatePath("/posts");
  revalidatePath("/feed");
  revalidatePath("/my_posts");
  if (postId) {
    revalidatePath(`/posts/${postId}`);
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(data: {
  title: string;
  content: string;
  tags?: string[];
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      tags: data.tags ?? [],
      authorEmail: session.user.email,
    },
  });

  revalidatePostPaths(post.id);

  return post;
}

export async function getPostById(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, authorEmail: session.user.email },
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  return post;
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.authorEmail !== session.user.email) {
    throw new Error("Post not found or unauthorized");
  }

  await prisma.post.delete({
    where: { id: postId, authorEmail: session.user.email },
  });

  revalidatePostPaths();

  return { message: "Post deleted successfully" };
}

export async function updatePost(
  postId: string,
  newData: { title?: string; content?: string; tags?: string[] }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.update({
    where: { id: postId, authorEmail: session.user.email },
    data: newData,
  });

  revalidatePostPaths(postId);

  return post;
}

// ─── Paginated Posts ──────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export async function getPaginatedPosts({
  cursor,
  searchQuery,
  tag,
}: {
  cursor?: string | null;
  searchQuery?: string;
  tag?: string;
}): Promise<{ posts: any[]; nextCursor: string | null }> {
  const where: Record<string, any> = {};

  if (searchQuery && searchQuery.trim()) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (tag && tag.trim()) {
    where.tags = { has: tag };
  }

  const posts = await prisma.post.findMany({
    where,
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  let nextCursor: string | null = null;
  if (posts.length > PAGE_SIZE) {
    const nextItem = posts.pop();
    nextCursor = nextItem!.id;
  }

  return { posts, nextCursor };
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function postComment({
  postId,
  content,
  parentId = null,
}: {
  postId: string;
  content: string;
  parentId?: string | null;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorEmail: session.user.email,
      parentId,
    },
  });

  revalidatePath(`/posts/${postId}`);

  return comment;
}

export async function deleteComment(commentId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });

  if (
    !comment ||
    !(
      comment.post.authorEmail == session.user.email ||
      comment.authorEmail == session.user.email
    )
  ) {
    throw new Error("Comment not found or unauthorized");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/posts/${comment.post.id}`);

  return { message: "Comment deleted successfully" };
}

export async function updateComment(commentId: string, newContent: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: {
        include: {
          author: true,
        },
      },
    },
  });

  if (
    !comment ||
    !(
      comment.post.authorEmail == session.user.email ||
      comment.authorEmail == session.user.email
    )
  ) {
    throw new Error("Comment not found or unauthorized");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content: newContent },
  });

  revalidatePath(`/posts/${comment.post.id}`);

  return { message: "Comment updated successfully" };
}
