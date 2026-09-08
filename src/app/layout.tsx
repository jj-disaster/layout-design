import type { Metadata } from "next";
import "@fontsource/nanum-gothic-coding/400.css";
import "@fontsource/nanum-gothic-coding/700.css";
import "./globals.css";
import Header from "@/components/Header";
import { withBasePath } from "@/lib/media";

export const metadata: Metadata = {
  title: "jj_disaster",
  description: "",
  icons: { icon: withBasePath("/favicon.ico") },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: "#000" }}>
      <body
        className="h-screen overflow-hidden bg-black"
        style={{ background: "#000", margin: 0 }}
      >
        <Header />
        <main className="h-screen bg-black">{children}</main>
      </body>
    </html>
  );
}
