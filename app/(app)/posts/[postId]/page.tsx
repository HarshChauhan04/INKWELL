import BackButton from "@/components/BackButton";
import PostCard from "@/components/PostCard";
import PostCommentSection from "@/components/PostCommentSection";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

// Allow on-demand SSR for post IDs not covered by generateStaticParams
// (i.e. newly created posts that weren't pre-built at build time)
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
      },
    });

    return posts.map((post) => ({
      postId: post.id,
    }));
  } catch (error) {
    console.warn("Skipping static params generation for posts due to database connection error:", error);
    return [];
  }
}

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: true,
        },
      },
    },
  });

  if (!post) {
    return notFound();
  }

  return (
    <section className="flex flex-col h-full gap-6 max-w-3xl mx-auto p-6 w-full">
      <BackButton />
      <PostCard post={post} open={true} />
      <PostCommentSection post={post} />
    </section>
  );
}
