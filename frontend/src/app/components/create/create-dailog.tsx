'use client'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAccount, useBalance } from "wagmi";
import { X } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

const CreateTokenDailog = ({
  isOpen,
  setIsOpen,
  setAmount,
  handleFirstBuy,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  handleFirstBuy: Function
}) => {

  const {t} = useTranslation();
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError } = useBalance({
    address: isConnected ? address : undefined,
    chainId: 1917
  });

  const [tokenCreated, setTokenCreated] = useState(false)
  const handleCreateToken = () => {
    setTokenCreated(false)
    handleFirstBuy()
    setTokenCreated(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#191C2F] border-gray-700 text-white max-w-md rounded-4xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-md font-bold bg-gradient-to-r from-[#0CA1B7] to-[#AB9003] bg-clip-text text-transparent">
            {t("launchWithBuy")}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {t("launchWithBuyNote")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              {t("enter")} {data?.symbol} {t("enterOpt")}:
            </label>
            <div className="text-xs text-gray-400">{t("balance")} {Number(data?.formatted).toFixed(3)} {data?.symbol}</div>
            <div className="relative">
              <Input
                type="number" // changed from number
                placeholder={`Amount of ${data?.symbol}`}
                //value={amount}
                onChange={(e: any) => setAmount(e.target.value)}
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:border-yellow-400 h-8 select-text cursor-text"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="text-gray-400 flex items-center">
                  {data?.symbol}
                  <img
                    src="/token-icon.svg"
                    className="w-4 h-4 ml-1"
                    alt="EPIX"
                  />
                </span>
              </div>
            </div>
          </div>
          {
            tokenCreated && <Spinner />
          }
          <Button className="w-full font-bold text-md" onClick={() => handleCreateToken()}>{t("createToken")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenDailog;
