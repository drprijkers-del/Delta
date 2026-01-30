import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/context";
import { BacklogLink } from "@/components/ui/backlog-link";
import { FeedbackButton } from "@/components/ui/feedback-button";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Delta | Agile Interventions",
  description: "Time-boxed Agile interventions. One focus, one experiment, one owner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased bg-stone-50 text-stone-900`}>
        <LanguageProvider>
          {children}
          <BacklogLink />
          <FeedbackButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
