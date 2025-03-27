import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrainDock - Talk to Your Documents",
  description: "Transform your PDFs into interactive conversations with AI",
  keywords: ["PDF", "chat", "AI", "document", "conversation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen h-screen overflow-hidden flex flex-col">
        <ClerkProvider>
          <Providers>
            <main className="flex-1 overflow-auto">{children}</main>
          </Providers>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
