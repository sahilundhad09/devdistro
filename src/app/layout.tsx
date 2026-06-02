import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevDistro — AI Distribution Plans for Indie Developers",
  description:
    "Describe your app or service. Get an exact distribution plan with specific subreddits, groups, directories, and ready-to-use message templates. Built for freelancers and indie developers.",
  keywords: ["distribution", "marketing", "indie hackers", "freelancers", "launch", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
