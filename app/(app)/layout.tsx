import { cn } from "@/lib/utils";
import Main from "@/components/Main";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Main
      id="main"
      className={cn(
        "main grid grid-rows-[auto_1fr_auto]",
        "h-dvh max-h-dvh w-full overflow-y-auto overflow-x-hidden",
        "ink-bg" // subtle ambient crimson glows from globals.css
      )}
    >
      <NavBar />
      <div className="flex flex-col py-2 px-2 md:px-10">{children}</div>
      <Footer />
    </Main>
  );
}
