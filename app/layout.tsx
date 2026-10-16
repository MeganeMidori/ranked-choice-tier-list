import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

// Stand-in for Futura (see --font-sans in globals.css) on devices that don't have it installed.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fanimaid Rename Poll",
  description: "Thank you for helping us lay the foundation for our next Maid Cafe! This form lets you vote for our new brand name. Votes will be tallied using ranked choice voting to ensure the most fair outcome. The winner of the poll will become our new brand name moving forward!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
