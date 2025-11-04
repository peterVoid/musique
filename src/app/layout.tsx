import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { PageLayout } from "@/components/homepage/page-layout";
import { MusiqueProvider } from "@/context/musique-context";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "Musique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        <MusiqueProvider>
          <PageLayout>{children}</PageLayout>
        </MusiqueProvider>
        <Toaster />
      </body>
    </html>
  );
}
