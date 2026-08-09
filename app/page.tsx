import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // Logged-in users go straight to the feed
  if (session) {
    redirect("/feed");
  }

  // Non-logged-in users see the landing page
  return <LandingPage />;
}
