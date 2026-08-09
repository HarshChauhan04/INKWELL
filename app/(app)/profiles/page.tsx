import RevealHero from "@/components/animations/RevealHero";
import PersonCard from "@/components/PersonCard";
import prisma from "@/prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const profiles = await prisma.user.findMany();

  return (
    <section className="flex flex-col h-full gap-5 max-w-4xl mx-auto p-4 w-full">
      <div className="flex items-center py-2">
        <RevealHero>
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 bg-primary rounded-full block" />
            <span className="text-2xl font-bold tracking-tight">People</span>
          </div>
        </RevealHero>
      </div>

      {profiles.length === 0 && (
        <span className="text-muted-foreground/60 mx-auto text-center text-balance py-12">
          No profiles found.
        </span>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Link href={`/profiles/${profile.id}`} key={profile.id}>
            <PersonCard profile={profile} />
          </Link>
        ))}
      </div>
    </section>
  );
}
