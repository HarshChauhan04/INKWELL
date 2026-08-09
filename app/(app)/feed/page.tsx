import RevealHero from "@/components/animations/RevealHero";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { getPaginatedPosts } from "@/actions/post.actions";
import InteractiveFeed from "@/components/InteractiveFeed";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  const { posts, nextCursor } = await getPaginatedPosts({ cursor: null });

  return (
    <section className="flex flex-col h-full gap-5 max-w-4xl mx-auto p-4 w-full">
      <div className="flex items-center justify-between py-2">
        <RevealHero>
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 bg-primary rounded-full block" />
            <span className="text-2xl font-bold tracking-tight">Feed</span>
          </div>
        </RevealHero>
        {session && (
          <Link href="/new_post">
            <Button className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all">
              <PlusIcon className="w-4 h-4" />
              New Post
            </Button>
          </Link>
        )}
      </div>

      <InteractiveFeed
        initialPosts={posts}
        initialCursor={nextCursor}
        session={session}
      />
    </section>
  );
}
