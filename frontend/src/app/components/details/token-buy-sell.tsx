"use client"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";
import { ethers } from "ethers";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  multicall,
  estimateGas,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { toastConfig, isValidAddress } from "../../utils/util";
import { toast } from "react-toastify";

import curveABI from "../../../abi/curve.json";
import erc20ABI from "../../../abi/erc20.json";
import Config from "../../config/config";

function TokenBuySell({
  tokenAddr,
  tokenInfo,
  curveInfo,
  refresh,
  setRefresh,
  tradeInfo,
  otherInfo
}: {
  tokenAddr: any;
  tokenInfo: any;
  curveInfo: any;
  refresh: any;
  setRefresh: any;
  tradeInfo: any;
  otherInfo: any;
}) {
  const account = useAccount()
  const config = useConfig()
  const router = useRouter()
  const { t } = useTranslation()

  const goBack = () => {
    router.back();
  };

  const [swapToggle, setSwapToggle] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [deadline, setDeadline] = useState("20");
  const [openSlippageModal, setOpenSlippageModal] = useState(false);
  const [frontRunning, setFrontRunning] = useState(false);
  const [epixAmount, setEpixAmount] = useState("0");
  const [tokenAmount, setTokenAmount] = useState("0");

  const [pending, setPending] = useState(false);
  const [btnMsg, setBtnMsg] = useState("Swap");
  const [errMsg, setErrMsg] = useState("");
  const [mevProtect, setMEVProtect] = useState(false);

  useEffect(() => {
    if (pending) {
      setBtnMsg("Pending...");
      setErrMsg("Pending... Please wait a second.");
      return;
    }
  }, [pending]);

  const getAmountOutEPIX = async (inputTokenAmount: any) => {
    if (inputTokenAmount === 0 || inputTokenAmount > tokenInfo.balance) return;
    setBtnMsg("Calculating...");
    setErrMsg("Calculating... Please wait a second");
    let _epixAmount = 0;
    try {
      if (swapToggle) {
        // sell
        // const contracts = [
        //   {
        //     address: Config.CURVE,
        //     abi: curveABI,
        //     functionName: "getAmountOutETH",
        //     args: [
        //       parseUnits(inputTokenAmount.toString(), Config.CURVE_DEC),
        //       tokenAddr,
        //     ],
        //   },
        // ];
        // const _data = await multicall(Config.config, { contracts } as any);
        // _epixAmount =
        //   _data[0].status === "success"
        //     ? parseFloat(formatUnits((_data[0] as any).result[0], Config.WETH_DEC))
        //     : 0;

        // setEpixAmount(_epixAmount > 0.000005 ? (_epixAmount - 0.000005).toFixed(5) : '0');
        const provider = new ethers.JsonRpcProvider(Config.RPC_URL); // or your existing provider
        const contract = new ethers.Contract(Config.CURVE, curveABI, provider);
        const inputAmount = ethers.parseUnits(inputTokenAmount.toString(), Config.CURVE_DEC);

        let _epixAmount = 0;

        try {
          const result = await contract.getAmountOutETH(inputAmount, tokenAddr);
          _epixAmount = parseFloat(ethers.formatUnits(result, Config.WETH_DEC));
        } catch (err) {
          console.error("getAmountOutETH failed:", err);
          _epixAmount = 0;
        }

        setEpixAmount(_epixAmount > 0.000005 ? (_epixAmount - 0.000005).toFixed(5) : "0");
      }
    } catch (err) {
      console.log(err);
    }
    if (inputTokenAmount > tokenInfo.balance) {
      setBtnMsg(t("insufficientFunds"));
      setErrMsg(t("insufficientFunds"));
    } else {
      setBtnMsg(t("swap"));
      setErrMsg("");
    }
  };

  const setBtnMsgInEpixAmount = (_epixAmount: any) => {
    if (!swapToggle) {
      if (_epixAmount > tokenInfo.epixBal) {
        setBtnMsg(t("insufficientFunds"));
        setErrMsg(t("insufficientFunds"));
      } else if (_epixAmount === 0) {
        setBtnMsg(t("enterValue"));
        setErrMsg(t("enterValue"));
      }
    }
  };

  const setBtnMsgInBepeAmount = (_tokenAmount: any) => {
    if (swapToggle) {
      if (_tokenAmount > tokenInfo.balance) {
        setBtnMsg(t("insufficientFunds"));
        setErrMsg(t("insufficientFunds"));
      } else if (_tokenAmount === 0) {
        setBtnMsg(t("enterValue"));
        setErrMsg(t("enterValue"));
      }
    }
  };

  const getTokenAmountMin = async (inputEpixAmount: any) => {
    if (inputEpixAmount === 0 || inputEpixAmount > tokenInfo.epixBal) return;
    setBtnMsg("Calculating...");
    setErrMsg(t("calculating"));
    let _tokenAmount = 0;
    let _epixAmount = 0;
    if (!swapToggle) {
      // buy
      _epixAmount = inputEpixAmount;
      const _curFunds = curveInfo?.funds >= 0 ? curveInfo?.funds : 0;
      if (_epixAmount + _curFunds > Config.CURVE_HARDCAP) {
        _epixAmount = Config.CURVE_HARDCAP - _curFunds;
      }
      // const contracts = [
      //   {
      //     address: Config.CURVE,
      //     abi: curveABI,
      //     functionName: "getAmountOutToken",
      //     args: [
      //       parseUnits(_epixAmount.toString(), 18),
      //       tokenAddr
      //     ],
      //   },
      // ];
      // const _data = await multicall(Config.config, { contracts } as any);
      // _tokenAmount =
      //   _data[0].status === "success"
      //     ? parseFloat(formatUnits(_data[0].result as any, Config.CURVE_DEC))
      //     : 0;
      // setTokenAmount(_tokenAmount > 0.005 ? (_tokenAmount - 0.005).toFixed(2) : '0');

      const provider = new ethers.JsonRpcProvider(Config.RPC_URL); // or your configured provider
      const contract = new ethers.Contract(Config.CURVE, curveABI, provider);
      const amountIn = ethers.parseUnits(_epixAmount.toString(), 18); // assuming _epixAmount is in human format

      let _tokenAmount = 0;

      try {
        const result = await contract.getAmountOutToken(amountIn, tokenAddr);
        _tokenAmount = parseFloat(ethers.formatUnits(result, Config.CURVE_DEC));
      } catch (err) {
        console.error("getAmountOutToken failed:", err);
        _tokenAmount = 0;
      }

      setTokenAmount(_tokenAmount > 0.005 ? (_tokenAmount - 0.005).toFixed(2) : "0");
    }
    if (inputEpixAmount > tokenInfo.epixBal) {
      setBtnMsg(t("insufficientFunds"));
      setErrMsg(t("insufficientFunds"));
    } else {
      setBtnMsg(t("swap"));
      setErrMsg("");
    }
  };

  // if (Number(e.target.value) >= 0) setAmount(e.target.value)
  const handleChangeAmount = async (e: any, fromTo: boolean) => {
    if (Number(e.target.value) >= 0) {
      if (!fromTo) {
        setTokenAmount(e.target.value);
        getAmountOutEPIX(Number(e.target.value));
        setBtnMsgInBepeAmount(Number(e.target.value));
      } else {
        setEpixAmount(e.target.value);
        getTokenAmountMin(Number(e.target.value));
        setBtnMsgInEpixAmount(Number(e.target.value));
      }
    } else {
      if (!fromTo) {
        setTokenAmount("0");
        setBtnMsgInBepeAmount(0);
      } else {
        setEpixAmount("0");
        setBtnMsgInEpixAmount(0);
      }
    }
  };

  const handleMax = async () => {
    if (swapToggle) {
      // sell
      setTokenAmount(tokenInfo?.balance ? tokenInfo?.balance : "0.00");
      getAmountOutEPIX(Number(tokenInfo?.balance ? tokenInfo?.balance : "0.00"));
      setBtnMsgInBepeAmount(
        Number(tokenInfo?.balance ? tokenInfo?.balance : "0.00")
      );
    } else {
      // buy
      const maxEpixVal =
        Number(tokenInfo?.epixBal ? tokenInfo?.epixBal : "0.0000") -
        Config.DEFAULT_GAS;
      if (maxEpixVal > 0) {
        const maxEpixValStr = maxEpixVal.toFixed(4);
        setEpixAmount(maxEpixValStr);
        getTokenAmountMin(Number(maxEpixValStr));
        setBtnMsgInEpixAmount(Number(maxEpixValStr));
      }
    }
  };

  const handleSwap = async () => {
    if (curveInfo?.status !== 0) {
      window?.open(`https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${curveInfo?.token}&chain=base`)
      return
    }
    if (curveInfo?.status === undefined || Number(curveInfo?.status) !== 0) {
      toast.warn("Curve is inactive.", toastConfig as any);
      return;
    }
    if (!account.isConnected || !account.address || !account.connector) {
      toast.warn("Please connect wallet!", toastConfig as any);
      return;
    }
    if (account.chainId !== Config.CHAIN.id) {
      toast.warn("Wrong Network, Please switch to Base Mainnet!", toastConfig as any);
      return;
    }
    if (pending) {
      toast.warn("Please wait for pending..", toastConfig as any);
      return;
    }
    if (errMsg && errMsg.length > 0) {
      toast.warn(errMsg, toastConfig as any);
      return;
    }

    setPending(true);
    try {
      const _deadline = Math.floor(Date.now() / 1000) + Number(deadline) * 60;
      let data = {};
      const provider = new ethers.BrowserProvider(window.ethereum);// or injected provider
      const curveContract = new ethers.Contract(Config.CURVE, curveABI, provider);
      const erc20 = new ethers.Contract(tokenAddr, erc20ABI, provider);

      console.log("====================================================")
      if (!swapToggle) {

        if (Number(epixAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input ETH amount to buy ${curveInfo?.symbol ? curveInfo?.symbol : "token"
            }!`,
            toastConfig as any
          );
          return;
        }
        const requiredEpixBal = Number(epixAmount) * (1 + Config.CURVE_SWAP_FEE);
        const tokenMin = (Number(tokenAmount) * (100 - parseFloat(slippage))) / 100;

        const referrer = window.localStorage.getItem("alpha_ref");
        // data = {
        //   address: Config.CURVE,
        //   abi: curveABI,
        //   functionName: "buy",
        //   args: [
        //     tokenAddr,
        //     parseUnits(tokenMin.toFixed(8), Config.CURVE_DEC),
        //     _deadline,
        //     isValidAddress(referrer) ? referrer : "0x0000000000000000000000000000000000000000"
        //   ],
        //   value: parseUnits(requiredEpixBal.toFixed(8), Config.WETH_DEC),
        // };
        // const encodedData = encodeFunctionData(data as any);
        // await estimateGas(config, {
        //   ...account,
        //   data: encodedData,
        //   to: (data as any).address,
        //   value: (data as any).value,
        // });

        // const txHash = await writeContract(config, {
        //   ...account,
        //   ...data,
        // } as any);

        // const txPendingData = waitForTransactionReceipt(config, {
        //   hash: txHash,
        // });
        // toast.promise(
        //   txPendingData,
        //   {
        //     pending: "Waiting for pending... 👌",
        //   },
        //   toastConfig as any
        // );

        // const txData = await txPendingData;
        // if (txData && txData.status === "success") {
        //   setEpixAmount("0");
        //   setTokenAmount("0");
        //   toast.success(`Successfully swapped token! 👍`, toastConfig as any);
        //   setRefresh(!refresh);
        // } else {
        //   toast.error("Error! Transaction is failed.", toastConfig as any);
        // }

        // Setup provider and signer (e.g., from wallet connection)

        const tokenMinParsed = ethers.parseUnits(tokenMin.toFixed(8), Config.CURVE_DEC);
        const valueParsed = ethers.parseUnits(requiredEpixBal.toFixed(8), Config.WETH_DEC);
        const ref = isValidAddress(referrer) ? referrer : "0x0000000000000000000000000000000000000000";

        try {
          // Estimate gas
          const estimatedGas = await curveContract.buy.estimateGas(
            tokenAddr,
            tokenMinParsed,
            _deadline,
            ref,
            { value: valueParsed }
          );

          // Send transaction
          const tx = await curveContract.buy(
            tokenAddr,
            tokenMinParsed,
            _deadline,
            ref,
            {
              value: valueParsed,
              gasLimit: estimatedGas,
            }
          );

          // Toast: Pending message
          toast.promise(
            tx.wait(),
            { pending: "Waiting for pending... 👌" },
            toastConfig as any
          );

          // Wait for receipt
          const receipt = await tx.wait();

          if (receipt.status === 1) {
            setEpixAmount("0");
            setTokenAmount("0");
            toast.success(`Successfully swapped token! 👍`, toastConfig as any);
            setRefresh(!refresh);
          } else {
            toast.error("Error! Transaction failed.", toastConfig as any);
          }
        } catch (err) {
          console.error("Transaction error:", err);
          toast.error("Error during transaction execution.", toastConfig as any);
        }
      } else {
        if (Number(tokenAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input ${curveInfo?.symbol ? curveInfo?.symbol : "token"
            } amount to sell!`,
            toastConfig as any
          );
          return;
        }
        const rawAllowance = await erc20.allowance(account.address, Config.CURVE);
        const allowance = parseFloat(ethers.formatUnits(rawAllowance, Config.CURVE_DEC));

        let tx;
        let receipt;

        // 2. Approve token if necessary
        if (allowance < Number(tokenAmount)) {
          tx = await erc20.approve(Config.CURVE, Config.MAX_UINT256);
          toast.promise(
            tx.wait(),
            {
              pending: "Waiting for approval... 👌",
              success: "Successfully enabled token! 👍",
              error: "Approval failed ❌",
            },
            toastConfig as any
          );

          receipt = await tx.wait();
          if (receipt.status !== 1) {
            setPending(false);
            return toast.error("Error! Approval transaction failed.", toastConfig as any);
          }
        }

        // 3. Call `sell` on curve
        const epixMin = (Number(epixAmount) * (100 - parseFloat(slippage))) / 100;

        const sellArgs = [
          tokenAddr,
          ethers.parseUnits(Number(tokenAmount).toFixed(8), Config.CURVE_DEC),
          ethers.parseUnits(epixMin.toFixed(8), Config.WETH_DEC),
          _deadline,
        ];

        console.log("sell transaction=============================")
        // Optional: estimate gas
        const gasEstimate = 1;//await curveContract.estimateGas.sell(...sellArgs);

        // Send tx
        tx = await curveContract.sell(...sellArgs, {
          gasLimit: gasEstimate,
        });

        toast.promise(
          tx.wait(),
          {
            pending: "Waiting for swap... 👌",
            success: "Successfully swapped token! 👍",
            error: "Swap failed ❌",
          },
          toastConfig as any
        );

        receipt = await tx.wait();

        if (receipt.status === 1) {
          setEpixAmount("0");
          setTokenAmount("0");
          setRefresh(!refresh);
        } else {
          toast.error("Error! Swap transaction failed.", toastConfig as any);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Error! Something went wrong.", toastConfig as any);
    }
    setPending(false);
    setBtnMsg("Swap");
    setErrMsg("");
  };

  useEffect(() => {
    // const script = document.createElement("script");
    // script.src = "/charting_library/charting_library.js";
    // script.type = "text/javascript";
    // script.async = true;
    // container.current.appendChild(script);
  }, []);

  return (
    <div className="bg-[#161616] rounded-4xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Label className="text-white font-bold">{t("mevProtection")}</Label>
          <button
            onClick={() => setMEVProtect(!mevProtect)}
            className={`w-12 h-6 rounded-full transition-colors relative bg-gray-700
             `}
          >
            {
              !mevProtect ? <div className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#FDD700] to-[#AB9003] top-0.5 transition-transform`} /> :
                <div className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#FDD700] to-[#AB9003] top-0.5 left-7 transition-transform`} />
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {
          !swapToggle ? <Button className="font-bold text-md" onClick={() => setSwapToggle(false)}>{t("buy")}</Button> :
            <Button variant="outline" className="font-bold text-md" onClick={() => setSwapToggle(false)}>{t("buy")}</Button>
        }
        {
          !swapToggle ? <Button variant="outline" className=" text-white font0-bold text-md" onClick={() => setSwapToggle(true)}>{t("sell")}</Button> :
            <Button className=" text-white font0-bold text-md" onClick={() => setSwapToggle(true)}>{t("sell")}</Button>
        }
      </div>

      {
        !swapToggle && <div className="text-sm bg-gradient-to-r from-[#FDD700] to-[#AB9003] bg-clip-text text-transparent mb-2 flex flex-1 justify-between">
          <span>{t("switchTo")} {curveInfo.name}</span>
          <span onClick={() => handleMax()}>{t("max")}</span>
        </div>
      }
      <div className="text-sm text-white mb-4">{t("balance")} {!swapToggle ? tokenInfo.epixBal : tokenInfo.balance} EPIX</div>

      <div className="flex items-center space-x-2 mb-4 bg-[#232321] p-3 rounded-4xl">
        {
          !swapToggle ? <img
            src="/token-icon.svg"
            className="w-6 h-6 rounded-full"
            alt="Token"
          /> :
            <img
              src={curveInfo.logo}
              className="w-6 h-6 rounded-full"
              alt="Token"
            />
        }
        <span className="text-white font-bold">{!swapToggle ? 'EPIX' : curveInfo.name}</span>
        <input className="w-full pl-4 focus:outline-none focus:border-none caret-white text-white" onChange={(e: any) => handleChangeAmount(e, !swapToggle)} value={!swapToggle ? epixAmount : tokenAmount}></input>
      </div>

      <div className={`grid ${!swapToggle ? "grid-cols-3" : "grid-cols-4"} gap-2 mb-6`}>
        {!swapToggle ? (["0.1 EPIX", "0.5 EPIX", "1 EPIX"].map((amount) => (
          <Button
            key={amount}
            variant="ghost"
            className="bg-[#232321] text-white font-bold hover:bg-[#2C2C2C] hover:text-white cursor-pointer"
            onClick={() => setEpixAmount(amount.split(" ")[0])}
          >
            {amount}
          </Button>
        ))) : (["25%", "50%", "75%", "100%"].map((amount) => (
          <Button
            key={amount}
            variant="ghost"
            className="bg-[#232321] text-white font-bold hover:bg-[#2C2C2C] hover:text-white cursor-pointer"
            onClick={() => setTokenAmount((Number(amount.slice(0, -1)) * tokenInfo.balance / 100).toString())}
          >
            {amount}
          </Button>
        )))}
      </div>

      <Button className="w-full bg-yellow-500 text-md hover:bg-yellow-400 font-bold" onClick={handleSwap}>
        {t("trade")}
      </Button>
      <span className="text-white mt-5 px-2 block text-sm font-bold">
        {t("thereare")} <b className="text-md">799,923,555.0 Shahid</b> {t("stillAvailable")}{" "}
        <b className="text-md">0.000585 EPIX </b>(
        <b className="text-md">{t("raisedAmount")} 0 EPIX</b>){t("intheBondingCurve")}.
        {t("whenMCReached")} <b className="text-md">$72,895.20</b> {t("allLiquidity")}
      </span>
    </div>
  );
};

export default memo(TokenBuySell);