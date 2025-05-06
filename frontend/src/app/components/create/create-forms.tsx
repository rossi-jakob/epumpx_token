'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "./image-upload";
import { RaisedToken } from "./raised-token";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";
import CreateTokenDailog from "./create-dailog";

import { toast } from "react-toastify";
import Config from "../../config/config"

import curveABI from "../../../abi/curve.json";
import multicallABI from "../../../abi/multicall.json"

import { encodeFunctionData, parseUnits, formatUnits, decodeEventLog } from "viem";
import {
  estimateGas,
  writeContract,
  waitForTransactionReceipt,
  multicall,
} from "@wagmi/core";

import { useAccount, useConfig } from "wagmi";
import {
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";

export const CreateForms = () => {
  const [refresh, setRefresh] = useState(false);
  const [addToken, setAddToken] = useState(false);
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [description, setDescription] = useState("")
  const [twitter, setTwitter] = useState("")
  const [telegram, setTelegram] = useState("")
  const [website, setWebsite] = useState("")
  const [logo, setLogo] = useState("")
  const [amount, setAmount] = useState(0)
  const [pending, setPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  const account = useAccount()
  const { isConnected, address } = useAccount()
  const config = useConfig()
  const { t } = useTranslation()

  const { openConnectModal } = useConnectModal();
  const onWalletConnect = () => {
    openConnectModal?.();
  }
  const handleFirstBuy = async () => {
    if (Number(amount) < 0) {
      toast.warn("Token amount should not be negative!")
      return;
    }

    setPending(true)

    try {
      const formData = new FormData()
      formData.append('image', logo)
      if (website) {
        formData.append('website', website)
      }
      if (twitter) {
        formData.append('twitter', twitter)
      }
      if (telegram) {
        formData.append('telegram', telegram)
      }
    } catch (e) {
      console.log(e)
      toast.error("Error! Something went wrong.")
    }

    if (logo) {
      // const _info = await multicall(Config.config, {
      //   contracts: [{
      //     address: Config.CURVE as any,
      //     abi: curveABI as any,
      //     functionName: "_getAmountOutToken",
      //     args: [parseUnits(amount.toString(), Config.WETH_DEC), Config.CURVE_VX, Config.CURVE_VY]
      //   },
      //   {
      //     address: Config.MULTICALL as any,
      //     abi: multicallABI as any,
      //     functionName: "getEthBalance",
      //     args: [account.address as any]
      //   }
      //   ]
      // })

      // const slippage = 0.5;
      // const _tokenAmount = _info[0].status === "success" ? parseFloat(formatUnits(_info[0].result as any, Config.CURVE_DEC)) : 0;
      // const bnbBal = account.address && _info[1].status === "success" ? parseFloat(formatUnits(_info[1].result as any, Config.WETH_DEC)) : 0
      // const tokenMin = _tokenAmount * (100 - slippage) / 100
      // const requiredBnbBal = Config.CURVE_CREATE_FEE + Number(amount) * (1 + Config.CURVE_SWAP_FEE)

      const provider = new ethers.JsonRpcProvider(Config.RPC_URL);

      // 1. Curve Contract Call
      const curveContract = new ethers.Contract(Config.CURVE, curveABI, provider);

      const amountIn = ethers.parseUnits(amount.toString(), Config.WETH_DEC);
      const amountOut = await curveContract._getAmountOutToken(
        amountIn,
        Config.CURVE_VX,
        Config.CURVE_VY
      );

      // 2. Get ETH Balance of Account
      let rawAddress = account.address || ''
      const normalizedAddress = rawAddress.startsWith('0x') ? rawAddress : `0x${rawAddress}`
      const balance = await provider.getBalance(normalizedAddress);

      const slippage = 0.5;
      const _tokenAmount = parseFloat(formatUnits(amountOut, Config.CURVE_DEC));
      const bnbBal = account.address ? parseFloat(formatUnits(balance, Config.WETH_DEC)) : 0
      const tokenMin = _tokenAmount * (100 - slippage) / 100
      const requiredBnbBal = Config.CURVE_CREATE_FEE + Number(amount) * (1 + Config.CURVE_SWAP_FEE)

      console.log("bal==============", requiredBnbBal, bnbBal, _tokenAmount)
      if (requiredBnbBal > bnbBal) {
        setPending(false)
        toast.warn("Insufficint funds")
        return
      }

      // Prepare the transaction data
      const data = {
        to: Config.CURVE,
        abi: curveABI,
        functionName: "createCurve",
        args: [
          name,
          symbol,
          logo,
          ethers.parseUnits(tokenMin.toFixed(8), Config.CURVE_DEC),
          description,
          twitter,
          telegram,
          website,
        ],
        value: ethers.parseUnits(requiredBnbBal.toFixed(8), Config.WETH_DEC),
      };

      // 1. Encode the function call data
      const encodedData = curveContract.interface.encodeFunctionData(data.functionName, data.args);

      console.log("encode======", encodedData)
      // 2. Estimate gas for the transaction
      const estimate = await provider.estimateGas({
        to: data.to,
        data: encodedData,
        value: data.value,
      });

      console.log("estimate======", estimate)
      // 3. Write the transaction (send it to the network)
      const tx = await curveContract.createCurve(...data.args, {
        value: data.value,
        gasLimit: estimate,
      });

      console.log("tx======", tx)
      // 4. Wait for the transaction receipt
      const receipt = await tx.wait();

      console.log("Transaction receipt:", receipt);

      toast.promise(
        receipt,
        {
          pending: "Waiting for pending... 👌",
        }
      );

      console.log('handleMint writeData: txHash: ', tx)
      const txData = await receipt;
      if (txData && txData.status === "success") {
        toast.success(`Successfully created token! 👍`);
        setRefresh(!refresh);
        setName("")
        setSymbol("")
        setDescription("")
        setAmount(0)
        setWebsite('')
        setTwitter('')
        setTelegram('')
        for (let i = 0; i < txData.logs.length; i++) {
          try {
            const decodeData = decodeEventLog({
              abi: curveABI,
              data: txData.logs[i].data,
              topics: txData.logs[i].topics
            })

            const args = decodeData.args as any;
            if (decodeData.eventName === "CurveCreated" && args.token) {
              router.push(`/token/${args.token}`)
            }
          } catch (error) {
            console.log('error', error)
          }
        }
      } else {
        toast.error("Error! Transaction is failed.");
      }

      setLogo("");
    }

    setAddToken(false)
    setPending(false)
    setIsOpen(false)
  }

  const onVerifyTokenInfo = () => {
    if (name == "") {
      toast.warn("Token name is required!")
      return
    }
    if (symbol == "") {
      toast.warn("Token symbol is required!")
      return
    }
    if (description == "") {
      toast.warn("Token description is required!")
      return
    }
    if (logo == "") {
      toast.warn("Token image is required!")
      return
    }

    setIsOpen(true)
  }

  const onImageUploaded = (imageUrl: string) => {
    setLogo(imageUrl);
    console.log("Image uploaded and URL received in parent:", imageUrl);
  };

  return (
    <div className=" mt-5 md:mt-27">
      <h1 className="text-4xl font-bold text-center text-white mb-10 ">
        {t("createToken")}
      </h1>
      <CreateTokenDailog isOpen={isOpen} setIsOpen={setIsOpen} setAmount={setAmount} handleFirstBuy={handleFirstBuy} />
      <div className="py-10 space-y-8">
        <ImageUpload
          onImageUploaded={onImageUploaded}
        />
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-4">
            <div>
              <Label className="block text-white mb-2 font-bold">
                {t("tokenName")}*
              </Label>
              <Input
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:outline-none focus:border-yellow-400 h-14"
                // placeholder="Enter Token Name"
                onChange={(e: any) => setName(e.target.value.toString())}
              />
            </div>
            <div>
              <Label className="block text-white mb-2 font-bold">
                {t("tokenSymbol")}*
              </Label>
              <Input
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:outline-none focus:border-yellow-400 h-14"
                // placeholder="Enter Token Symbol"
                onChange={(e: any) => setSymbol(e.target.value.toString())}
              />
            </div>
            <div>
              <Label className="block text-white mb-2 font-bold">
                {t("tokenDescription")}*
              </Label>
              <Input
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:outline-none focus:border-yellow-400 h-14"
                // placeholder="Enter Token Description"
                onChange={(e: any) => setDescription(e.target.value.toString())}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="block text-white mb-2 font-bold">
                {t("tokenWebsite")}
              </Label>
              <Input
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:outline-none focus:border-yellow-400 h-14"
                // placeholder="Enter Website URL"
                onChange={(e: any) => setWebsite(e.target.value.toString())}
              />
            </div>
            <div>
              <Label className="block text-white mb-2 font-bold">
                {t("tokenTelegram")}
              </Label>
              <Input
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:outline-none focus:border-yellow-400 h-14"
                // placeholder="Enter Telegram URL"
                onChange={(e: any) => setTelegram(e.target.value.toString())}
              />
            </div>
            <div>
              <Label className="block text-white mb-2 font-bold">
                {t("tokenTwitter")}
              </Label>
              <Input
                className="w-full bg-[#22221D87]/53 border border-gray-400 rounded-full px-4 py-3 text-white focus:outline-none focus:border-yellow-400 h-14"
                // placeholder="Enter Twitter URL"
                onChange={(e: any) => setTwitter(e.target.value.toString())}
              />
            </div>
          </div>
        </div>

        {/* Raised Token */}
        <RaisedToken />

        {/* Extra Options */}
        {/* <div className="flex items-center gap-3">
          <Label className="text-white font-bold">Extra Options</Label>
          <button
            onClick={() => setExtraOptions(!extraOptions)}
            className={`w-12 h-6 rounded-full transition-colors relative bg-gray-700 cursor-pointer
            ${extraOptions ? "bg-white" : "bg-gray-700"}`}
          >
            <div
              className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#FDD700] to-[#AB9003] top-0.5 transition-transform
              ${extraOptions ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </button>
        </div> */}

        {/* Connect Wallet Button */}
        <div className="hidden md:block flex justify-center ">
          <Button
            className="px-8 py-3 font-bold font-md text-white"
            onClick={() => account.isConnected ? onVerifyTokenInfo() : onWalletConnect()}
          >
            {account.isConnected ?
              t("createToken") :
              t("connectWallet")}
          </Button>
        </div>

        <div className="md:hidden flex justify-center ">
          <Button
            className="px-8 py-3 font-bold font-md text-white"
            onClick={() => setIsOpen(true)}
            disabled={!isConnected}
          >
            {t("createToken")}
          </Button>
        </div>
      </div>
    </div>
  );
};
