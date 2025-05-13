import type { Metadata } from "next";
import { Outfit, Exo_2 } from "next/font/google";

import "./globals.css";
import { I18nProvider } from './i18Provider';
import Navbar from "./components/Navbar";
import Footer from "./components/footer";

import { ToastContainer } from "react-toastify";
import "@rainbow-me/rainbowkit/styles.css";
import WalletProvider from "./providers";
const Exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'EPumpX',
  description: "Launch your own meme coin in seconds. No coding, no barriers—just launch and trade. It's fast, cheap, and open to everyone. Start now and be early. Your coin could be the next big thing.",
  metadataBase: new URL('https://epumpx-token.vercel.app'), // Needed for Open Graph URLs
  openGraph: {
    title: 'EPumpX',
    description: "Launch your own meme coin in seconds. No coding, no barriers—just launch and trade. It's fast, cheap, and open to everyone. Start now and be early. Your coin could be the next big thing.",
    url: 'https://epumpx-token.vercel.app',
    siteName: 'EPumpX',
    images: [
      {
        url: '/epix-thumbnail.webp',
        width: 1280,
        height: 720,
        alt: 'EPumpX Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPumpX',
    description: "Launch your own meme coin in seconds. No coding, no barriers—just launch and trade. It's fast, cheap, and open to everyone. Start now and be early. Your coin could be the next big thing.",
    images: ['/epix-thumbnail.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body className={` ${Exo2.className} ${Exo2.variable} antialiased`}>
        <div className="flex flex-col min-h-screen h ">
          <WalletProvider>
            <I18nProvider>
              <Navbar />
              {children}
              <Footer />
              <ToastContainer position="top-right" autoClose={3000} />
              {/* <Script
              src="/charting_library/charting_library.js"  // Ensure this is the correct path
              strategy="beforeInteractive"  // Load before interactive
            /> */}
            </I18nProvider>
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}
