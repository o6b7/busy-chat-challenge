import "./../styles/globals.css";
import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Resume Assistant Pro",
  description:
    "AI-powered resume analysis and candidate communication platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-gray-900 text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-400">
              © 2025 Resume Assistant Pro. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
