import RevealHero from "@/components/animations/RevealHero";
import BackButton from "@/components/BackButton";
import PersonCard from "@/components/PersonCard";
import PostCard from "@/components/PostCard";
import prisma from "@/prisma/client";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
    });

    return users.map((user) => ({
      userId: user.id,
    }));
  } catch (error) {
    console.warn("Skipping static params generation for profiles due to database connection error:", error);
    return [];
  }
}

interface PersonPageProps {
  params: Promise<{ userId: string }>;
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        include: {
          author: true,
        },
      },
    },
  });

  if (!user) {
    return notFound();
  }

  return (
    <section className="flex flex-col h-full gap-2 max-w-3xl mx-auto p-6 w-full">
      <BackButton className="mr-auto" />
      <PersonCard profile={user} />
      <RevealHero className="ml-4">
        <span className="text-2xl font-bold">{`Posts (${user.posts.length})`}</span>
      </RevealHero>
      <div className="flex flex-col gap-4">
        {user.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
