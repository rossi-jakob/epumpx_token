'use client'

import * as React from "react";
import { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";

import { useAccount, useDisconnect } from "wagmi";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-r from-[#8346FF] to-[#9458DF] text-black shadow-xs hover:from-[#7037EF] hover:to-[#8448CF] dark:hover:from-[#7037EF/90] dark:hover:to-[#8448CF/90]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border-2 bg-background shadow-xs   border-white text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const ConnectBtn = ({ handleLogin }: any) => {
  const { isConnecting, address, isConnected, chain } = useAccount()
  const { openAccountModal } = useAccountModal()
  const { openChainModal } = useChainModal()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const {t} = useTranslation()

  const [isOpen, setIsOpen] = useState(false);

  const handleTGLoginModal = () => {
    handleLogin?.();
  };

  // Wait until client and wallet are ready (don't render until the state is set)

  // Not connected and not ready to display the wallet connection
  if (!isConnected) {
    return (
      <Button
        onClick={() => {
          if (isConnected) disconnect();
          //handleTGLoginModal();
          openConnectModal?.()
        }}
        disabled={isConnecting}
        variant="outline"
        className="font-bold text-md border-gray-400"
      >
        {isConnecting ? t("connecting")+'...' : t("connectWallet")}
      </Button>
    );
  }

  // Connected but wrong network
  if (!isConnected) {
    return (
      <button
        className="flex flex-row gap-[10px] items-center btn text-white font-bold cursor-pointer border-2 border-white rounded-full px-[10px] py-[5px]"
        onClick={() => openChainModal?.()}
      >
        {t("wrongNetwork")}
      </button>
    );
  }

  // Wallet connected
  return (
    <div className="w-full md:max-w-5xl flex items-center justify-between" suppressHydrationWarning>
      <div className="relative flex flex-col">
        <div className="flex flex-row gap-[10px] items-center btn text-white hover:font-bold cursor-pointer border-2 border-[#7555F4] rounded-full px-[10px] py-[5px] min-w-[200px]">
          {            
            isConnected && <img src="/token-icon.svg" className="w-6" onClick={() => openAccountModal?.()} />
          }
          {isConnected && address
            ? `${address.slice(0, 6)} ... ${address.slice(-4)}`
              : 'Connect Wallet'}
          <div onClick={() => setIsOpen((prev) => !prev)}>
            <svg fill="white" viewBox="0 0 13 8" width="13"><g><path d="M6.49024 5.27362L1.45675 0.240116C1.15026 -0.0663668 0.62501 -0.0663668 0.318784 0.240116L0.231327 0.327573C-0.0751559 0.634055 -0.0751559 1.15931 0.231327 1.50939L5.87779 7.15586C6.05271 7.33103 6.27173 7.41848 6.4905 7.37488C6.70953 7.37488 6.9283 7.28743 7.10321 7.15586L12.7497 1.50939C13.0562 1.20291 13.0562 0.677655 12.7497 0.371429L12.6622 0.283973C12.3557 -0.0225103 11.8307 -0.0225103 11.5243 0.283973L6.49024 5.27362Z"></path></g></svg>
          </div>
        </div>
        <div className={`absolute top-[45px] flex-col text-white ${isOpen ? 'flex' : 'hidden'} rounded-[8px] w-full px-[5px] bg-[#14212E] text-center text-sm`}>
          <span className="cursor-pointer hover:font-bold p-[4px]" onClick={() => { openChainModal?.(); setIsOpen(false); }}>{t("profile")}</span>
          {/* <span className="cursor-pointer hover:font-bold p-[4px]">Referral</span> */}
          <span className="cursor-pointer hover:font-bold p-[4px]" onClick={() => { disconnect?.(); setIsOpen(false); }}>{t("disconnect")}</span>
        </div>
      </div>
    </div>
  );
};

export { Button, buttonVariants, ConnectBtn };
