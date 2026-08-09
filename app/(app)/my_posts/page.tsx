import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import prisma from "@/prisma/client";
import { authOptions } from "@/utils/authOptions";
import { PlusIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);

  const posts = await prisma.post.findMany({
    where: {
      authorEmail: session?.user?.email ?? undefined,
    },
    include: {
      author: true,
    },
  });

  return (
    <section className="flex flex-col h-full gap-4 max-w-4xl mx-auto p-4 w-full">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">My Posts</span>
        <Link href="/new_post">
          <Button>
            <PlusIcon />
            New Post
          </Button>
        </Link>
      </div>
      {posts.length === 0 && (
        <span className="text-muted-foreground mx-auto text-center text-balance">
          You have not created any posts yet. Click the button above to create
          your first post.
        </span>
      )}
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
