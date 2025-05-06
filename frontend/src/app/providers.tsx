'use client';
import Config from "./config/config";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import dynamic from 'next/dynamic';

const RainbowKitProviderNoSSR = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.RainbowKitProvider),
  { ssr: false }
);

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={Config.config}>
      <QueryClientProvider client={queryClient}>
        {/* 👇 Only wraps a <div>, not <html> or <body> */}
        <RainbowKitProviderNoSSR
          theme={darkTheme({
            accentColor: "#0E76FD",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProviderNoSSR>
      </QueryClientProvider>
    </WagmiProvider>
  );
}