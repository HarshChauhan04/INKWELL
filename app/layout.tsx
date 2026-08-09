import type { Metadata } from "next";
import "./globals.css";
import NextAuthSessionProviders from "@/providers/NextAuthSessionProviders";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Inkwell — Write. Share. Inspire.",
  description: "A space for thinkers, writers, and storytellers. Craft your ideas and share your voice with the world.",
};

/**
 * Root layout — minimal shell.
 * The NavBar/Footer are rendered in the (app) route group layout
 * so the landing page (/) can be full-screen without them.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextAuthSessionProviders>
          <ThemeProvider>
            {children}
            <Toaster richColors={true} />
          </ThemeProvider>
        </NextAuthSessionProviders>
      </body>
    </html>
  );
}
