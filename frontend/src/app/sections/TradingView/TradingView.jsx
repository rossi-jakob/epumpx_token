'use client'
import React, { useState, useEffect, useRef, memo } from "react";
import { toast } from "react-toastify";
import { BsGlobe2 } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

import {
  multicall,
  estimateGas,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";

import EasingY from "@/app/components/animations/EasingY";
import GradientEllipse from "@/app/components/gradient-ellipsis";
import TokenDetails from "@/app/components/details/token-details";
import { TokenSidebarInfo } from "@/app/components/details/token-sidebar-info";
import { TokenTrades } from "@/app/components/details/token-trades";
import { TokenSupply } from "@/app/components/details/token-supply";

import { toastConfig, isValidAddress } from "../../utils/util";

import baseLogo from "../../../../public/logo.png";
import curveABI from "@/abi/curve.json";
import erc20ABI from "@/abi/erc20.json";
import Config from "@/app/config/config";

import Chart from "@/components/tradingview";
import EventAlert from "@/app/components/eventAlert/EventAlert";
import Slippage from "@/app/components/slippage/Slippage";
import Script from "next/script";

import { useCurveStatus } from "@/app/components/hooks/useCurveStatus";

function TradingView({
  tokenAddr,
  tokenInfo,
  curveInfo,
  refresh,
  setRefresh,
  // tradeInfo,
  // otherInfo
}) {

  const account = useAccount()
  const config = useConfig()
  const router = useRouter()
  const {t} = useTranslation()

  const {
    tradeData,
    holderData,
  } = useCurveStatus(refresh, tokenAddr);

  const [swapToggle, setSwapToggle] = useState(false);
  const [toggleComment, setCommentToggle] = useState(false);
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

  const container = useRef();

  useEffect(() => {
    if (pending) {
      setBtnMsg("Pending...");
      setErrMsg("Pending... Please wait a second.");
      return;
    }
  }, [pending]);

  const getAmountOutEPIX = async (inputTokenAmount) => {
    if (inputTokenAmount === 0 || inputTokenAmount > tokenInfo.balance) return;
    setBtnMsg("Calculating...");
    setErrMsg("Calculating... Please wait a second");
    let _epixAmount = 0;
    try {
      if (swapToggle) {
        // sell
        const contracts = [
          {
            address: Config.CURVE,
            abi: curveABI,
            functionName: "getAmountOutETH",
            args: [
              parseUnits(inputTokenAmount.toString(), Config.CURVE_DEC),
              tokenAddr,
            ],
          },
        ];
        const _data = await multicall(Config.config, { contracts });
        _epixAmount =
          _data[0].status === "success"
            ? parseFloat(formatUnits(_data[0].result[0], Config.WETH_DEC))
            : 0;
        setEpixAmount(_epixAmount > 0.000005 ? (_epixAmount - 0.000005).toFixed(5) : '0');
      }
    } catch (err) {
      console.log(err);
    }
    if (inputTokenAmount > tokenInfo.balance) {
      setBtnMsg("Insufficient funds");
      setErrMsg("Insufficient funds");
    } else {
      setBtnMsg("Swap");
      setErrMsg("");
    }
  };

  const setBtnMsgInEpixAmount = (_epixAmount) => {
    if (!swapToggle) {
      if (_epixAmount > tokenInfo.epixBal) {
        setBtnMsg("Insufficient funds");
        setErrMsg("Insufficient funds");
      } else if (_epixAmount === 0) {
        setBtnMsg("Enter the value");
        setErrMsg("Enter the value");
      }
    }
  };

  const setBtnMsgInBepeAmount = (_tokenAmount) => {
    if (swapToggle) {
      if (_tokenAmount > tokenInfo.balance) {
        setBtnMsg("Insufficient funds");
        setErrMsg("Insufficient funds");
      } else if (_tokenAmount === 0) {
        setBtnMsg("Enter the value");
        setErrMsg("Enter the value");
      }
    }
  };

  const getTokenAmountMin = async (inputEpixAmount) => {
    if (inputEpixAmount === 0 || inputEpixAmount > tokenInfo.epixBal) return;
    setBtnMsg("Calculating...");
    setErrMsg("Calculating... Please wait a second");
    let _tokenAmount = 0;
    let _epixAmount = 0;
    if (!swapToggle) {
      // buy
      _epixAmount = inputEpixAmount;
      const _curFunds = curveInfo?.funds >= 0 ? curveInfo?.funds : 0;
      if (_epixAmount + _curFunds > Config.CURVE_HARDCAP) {
        _epixAmount = Config.CURVE_HARDCAP - _curFunds;
      }
      const contracts = [
        {
          address: Config.CURVE,
          abi: curveABI,
          functionName: "getAmountOutToken",
          args: [
            parseUnits(_epixAmount.toString(), 18),
            tokenAddr
          ],
        },
      ];
      const _data = await multicall(Config.config, { contracts });
      _tokenAmount =
        _data[0].status === "success"
          ? parseFloat(formatUnits(_data[0].result, Config.CURVE_DEC))
          : 0;
      setTokenAmount(_tokenAmount > 0.005 ? (_tokenAmount - 0.005).toFixed(2) : '0');
    }
    if (inputEpixAmount > tokenInfo.epixBal) {
      setBtnMsg("Insufficient funds");
      setErrMsg("Insufficient funds");
    } else {
      setBtnMsg("Swap");
      setErrMsg("");
    }
  };

  // if (Number(e.target.value) >= 0) setAmount(e.target.value)
  const handleChangeAmount = async (e, fromTo) => {
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
      ); 3
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

  // const handleAddToken = async () => {
  //   try {
  //     // wasAdded is a boolean. Like any RPC method, an error may be thrown.
  //     const wasAdded = await window.ethereum.request({
  //       method: "wallet_watchAsset",
  //       params: {
  //         type: "ERC20", // Initially only supports ERC20, but eventually more!
  //         options: {
  //           address: tokenAddr, // The address that the token is at.
  //           symbol: `${curveInfo?.symbol ? curveInfo?.symbol : "token"}`, // A ticker symbol or shorthand, up to 5 chars.
  //           decimals: Config.CURVE_DEC, // The number of decimals in the token
  //           image: `${curveInfo?.logo
  //             ? `${Config.API_URL}/logos/${curveInfo?.logo}`
  //             : baseLogo
  //             }`, // A string url of the token logo
  //         },
  //       },
  //     });

  //     if (wasAdded) {
  //       toast.success(
  //         "Successfully added token to the metamask! 👍",
  //         toastConfig
  //       );
  //     } else {
  //       // console.log("wasAdded: ");
  //       // console.log('wasAdded: ', wasAdded);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleSwap = async () => {
    if (curveInfo?.status !== 0) {
      window.open(`https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${curveInfo?.token}&chain=base`)
      return
    }
    if (curveInfo?.status === undefined || Number(curveInfo?.status) !== 0) {
      toast.warn("Curve is inactive.", toastConfig);
      return;
    }
    if (!account.isConnected || !account.address || !account.connector) {
      toast.warn("Please connect wallet!", toastConfig);
      return;
    }
    if (account.chainId !== Config.CHAIN.id) {
      toast.warn("Wrong Network, Please switch to Base Mainnet!", toastConfig);
      return;
    }
    if (pending) {
      toast.warn("Please wait for pending..", toastConfig);
      return;
    }
    if (errMsg && errMsg.length > 0) {
      toast.warn(errMsg, toastConfig);
      return;
    }
    setPending(true);
    try {
      const _deadline = parseInt(Date.now() / 1000) + Number(deadline) * 60;
      let data = {};
      if (!swapToggle) {
        if (Number(epixAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input EPIX amount to buy ${curveInfo?.symbol ? curveInfo?.symbol : "token"
            }!`,
            toastConfig
          );
          return;
        }
        const requiredEpixBal = Number(epixAmount) * (1 + Config.CURVE_SWAP_FEE);
        const tokenMin = (Number(tokenAmount) * (100 - slippage)) / 100;

        const referrer = window?.localStorage?.getItem("alpha_ref");

        data = {
          address: Config.CURVE,
          abi: curveABI,
          functionName: "buy",
          args: [
            tokenAddr,
            parseUnits(tokenMin.toFixed(8), Config.CURVE_DEC),
            _deadline,
            isValidAddress(referrer) ? referrer : "0x0000000000000000000000000000000000000000"
          ],
          value: parseUnits(requiredEpixBal.toFixed(8), Config.WETH_DEC),
        };
        const encodedData = encodeFunctionData(data);
        await estimateGas(config, {
          ...account,
          data: encodedData,
          to: data.address,
          value: data.value,
        });
        const txHash = await writeContract(config, {
          ...account,
          ...data,
        });

        const txPendingData = waitForTransactionReceipt(config, {
          hash: txHash,
        });
        toast.promise(
          txPendingData,
          {
            pending: "Waiting for pending... 👌",
          },
          toastConfig
        );

        const txData = await txPendingData;
        if (txData && txData.status === "success") {
          setEpixAmount("0");
          setTokenAmount("0");
          toast.success(`Successfully swapped token! 👍`, toastConfig);
          setRefresh(!refresh);
        } else {
          toast.error("Error! Transaction is failed.", toastConfig);
        }
      } else {
        if (Number(tokenAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input ${curveInfo?.symbol ? curveInfo?.symbol : "token"
            } amount to sell!`,
            toastConfig
          );
          return;
        }
        const _data = await multicall(Config.config, {
          contracts: [
            {
              address: tokenAddr,
              abi: erc20ABI,
              functionName: "allowance",
              args: [
                account.address,
                Config.CURVE
              ],
            },
          ],
        });
        const allowance =
          _data[0].status === "success"
            ? parseFloat(formatUnits(_data[0].result, Config.CURVE_DEC))
            : 0;

        let encodedData;
        let txHash;
        let txPendingData;
        let txData;
        if (allowance < Number(tokenAmount)) {
          data = {
            address: tokenAddr,
            abi: erc20ABI,
            functionName: "approve",
            args: [
              Config.CURVE,
              Config.MAX_UINT256
            ],
            value: 0,
          };
          encodedData = encodeFunctionData(data);
          await estimateGas(config, {
            ...account,
            data: encodedData,
            to: data.address,
            value: data.value,
          });
          txHash = await writeContract(config, {
            ...account,
            ...data,
          });

          txPendingData = waitForTransactionReceipt(config, {
            hash: txHash,
          });
          toast.promise(
            txPendingData,
            {
              pending: "Waiting for pending... 👌",
            },
            toastConfig
          );

          txData = await txPendingData;
          if (txData && txData.status === "success") {
            toast.success(`Successfully enabled token! 👍`, toastConfig);
          } else {
            setPending(false);
            toast.error("Error! Transaction is failed.", toastConfig);
            return;
          }
        }

        const epixMin = (Number(epixAmount) * (100 - slippage)) / 100;
        data = {
          address: Config.CURVE,
          abi: curveABI,
          functionName: "sell",
          args: [
            tokenAddr,
            parseUnits(Number(tokenAmount).toFixed(8), Config.CURVE_DEC),
            parseUnits(epixMin.toFixed(8), Config.WETH_DEC),
            _deadline,
          ],
        };
        encodedData = encodeFunctionData(data);
        await estimateGas(config, {
          ...account,
          data: encodedData,
          to: data.address,
        });
        txHash = await writeContract(config, {
          ...account,
          ...data,
        });

        txPendingData = waitForTransactionReceipt(config, {
          hash: txHash,
        });
        toast.promise(
          txPendingData,
          {
            pending: "Waiting for pending... 👌",
          },
          toastConfig
        );

        txData = await txPendingData;
        if (txData && txData.status === "success") {
          setEpixAmount("0");
          setTokenAmount("0");
          setRefresh(!refresh);
          toast.success(`Successfully swapped token! 👍`, toastConfig);
        } else {
          toast.error("Error! Transaction is failed.", toastConfig);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Error! Something went wrong.", toastConfig);
    }
    setPending(false);
    setBtnMsg("Swap");
    setErrMsg("");
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/charting_library/charting_library.js";
    script.type = "text/javascript";
    script.async = true;
    container.current.appendChild(script);
  }, []);

  return (
    <section className="leading-none relative">
      <div className="container" suppressHydrationWarning={true}>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 items-start">
          <div className="col-span-2">
            <div className="bg-[#191C2F] rounded-4xl py-6">
              <GradientEllipse
                position="top-center"
                width="30%"
                height="40%"
                opacity={0.5}
                color="#1E99A299"
                // blur="60px"
                zIndex={20}
              />
              <GradientEllipse
                position="custom"
                customPosition={{ top: "40%", right: "20%" }}
                width="25%"
                height="30%"
                opacity={0.5}
                color="#5C44D799"
                // blur="50px"
                zIndex={20}
              />
              <TokenDetails
                tokenAddr={tokenAddr}
                tradeData={tradeData}
                curveInfo={curveInfo}
              />
              <div className="wrapper">
                {/* <EventAlert tradeInfo={tradeInfo} otherInfo={otherInfo} /> */}
                {/* grid */}
                <div className="flex flex-col md:grid gap-8 grid-cols-9">
                  <div className="wrap col-span-9 flex flex-col h-full m-4">
                    <div className="top flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:mb-2.5">
                      <div className="left flex items-center gap-4">
                        <div className="wrap flex gap-1.5 items-center">
                          {/* <Image
                          className="max-w-[3rem] w-full rounded-lg"
                          width={100}
                          height={100}
                          src={`${Config.API_URL}/logos/${curveInfo.logo}`}
                          alt="logo"
                        /> */}

                          {/* name */}
                          {/* <div className="name !text-[1.5rem]">{`${curveInfo?.symbol ? curveInfo?.symbol : "---"
                          } (${curveInfo?.name ? curveInfo?.name : "---"})`}</div> */}

                          {/* chain */}
                          {/* <div className="chain ml-2">
                          <Image width={20} height={20} src={baseLogo} alt="base" />
                        </div> */}
                        </div>

                        {/* links */}
                        <div className="links flex gap-2.5">
                          {curveInfo?.website && curveInfo?.website.length > 0 ? (
                            <a
                              href={curveInfo?.website}
                              className="website text-base hover:text-secondary transition-all duration-300"
                              target="_blank"
                            >
                              <BsGlobe2 />
                            </a>
                          ) : (
                            <></>
                          )}
                          {curveInfo?.telegram && curveInfo?.telegram.length > 0 ? (
                            <a
                              href={curveInfo?.telegram}
                              className="telegram text-base hover:text-secondary transition-all duration-300"
                              target="_blank"
                            >
                              <FaTelegramPlane />
                            </a>
                          ) : (
                            <></>
                          )}
                          {curveInfo?.twitter && curveInfo?.twitter.length > 0 ? (
                            <a
                              href={curveInfo?.twitter}
                              className="twitter text-base hover:text-secondary transition-all duration-300"
                              target="_blank"
                            >
                              <FaXTwitter />
                            </a>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                      <div className="right">
                        <div className="wrap flex gap-2 items-center">
                          {/* img */}
                          {/* <div className="img rounded-full overflow-hidden">
                          <Image width={20} height={20} src={image} alt="image" />
                        </div> */}

                          {/* address */}
                          {/* <div className="address">{spliceAdress(tokenAddr)}</div>

                        <FaCopy
                          className="copy text-sm cursor-pointer hover:text-primary transition-all duration-300"
                          onClick={() => copyAddress(tokenAddr)}
                        /> */}

                          {/* market */}
                          {/* <div className="wrap flex gap-3 text-base">
              
                          <div className="virtual liquidity">Virtual Liquidity: ${VirtualLiquidity}</div>
                        </div> */}
                        </div>
                      </div>
                    </div>

                    <EasingY cls="h-[500px] md:h-[calc(100%-70px)]" value={-60} delay={0.1}>
                      <div
                        className="tradingview-widget-container h-full !border !border-gray-500 !rounded-md"
                        ref={container}
                        style={{ height: "99.5%", width: "100%" }}
                      >
                        {curveInfo.symbol && tokenAddr ? curveInfo?.status !== undefined && Number(curveInfo?.status) !== 2 ?
                          <Chart
                            stock={"Stock"}
                            interval="1"
                            tokenId={tokenAddr}
                            symbol={`${curveInfo.symbol ? curveInfo.symbol : "---"
                              }/USD`
                            }
                          /> : <iframe src={`https://dexscreener.com/base/${tokenAddr}?embed=1&theme=dark&trades=0&info=0`} className="w-full h-full" /> : <></>}
                      </div>
                    </EasingY>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="outline"
                className="text-md font-bold border-2 border-gray-400"
                onClick={() => setCommentToggle(true)}
              >
                {t("comment")}
              </Button>
              <Button className="text-md font-bold text-white" onClick={() => setCommentToggle(false)}>{t("trades")}</Button>
            </div>
            {
              !toggleComment ? <TokenTrades
                tokenAddr={tokenAddr}
                tokenInfo={tokenInfo}
                curveInfo={curveInfo} /> :
                <span>{curveInfo.description}</span>
            }
          </div>

          {/* swap */}
          <div className="flex flex-col">
            <TokenSidebarInfo curveInfo={curveInfo} />
            <div className="space-y-2 mt-8 mb-6">
              <div className="text-md text-white font-bold">
                {`Bonding Curve Progress: ${curveInfo?.funds >= 0
                    ? curveInfo.funds > Config.CURVE_HARDCAP
                      ? 100
                      : (
                        (curveInfo.funds * 100) /
                        Config.CURVE_HARDCAP
                      ).toFixed(2)
                    : 0
                  }%`}
              </div>
              <div className="w-full h-2 bg-[#474647]  rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-[#8346FF] to-[#9458DF]"
                  style={{
                    width: `${curveInfo?.funds >= 0
                      ? curveInfo.funds > Config.CURVE_HARDCAP
                        ? 100
                        : (
                          (curveInfo.funds * 100) /
                          Config.CURVE_HARDCAP
                        ).toFixed(2)
                      : 0
                      }%`,
                  }}></div>
              </div>
            </div>
            <div className="bg-[#191C2F] rounded-4xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Label className="text-white font-bold">{t("mevProtection")}</Label>
                  <button
                    onClick={() => setMEVProtect(!mevProtect)}
                    className={`w-12 h-6 rounded-full transition-colors relative bg-gray-700`}
                  >
                    {
                      !mevProtect ? <div className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#8346FF] to-[#9458DF] top-0.5 transition-transform`} /> :
                        <div className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#8346FF] to-[#9458DF] top-0.5 left-7 transition-transform`} />
                    }
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {
                  !swapToggle ? <Button className="font-bold text-white text-md" onClick={() => setSwapToggle(false)}>{t("buy")}</Button> :
                    <Button variant="outline" className="font-bold text-white text-md" onClick={() => setSwapToggle(false)}>{t("buy")}</Button>
                }
                {
                  !swapToggle ? <Button variant="outline" className=" text-white font0-bold text-md" onClick={() => setSwapToggle(true)}>{t("sell")}</Button> :
                    <Button className=" text-white font0-bold text-md" onClick={() => setSwapToggle(true)}>{t("sell")}</Button>
                }
              </div>

              {
                !swapToggle && <div className="text-sm bg-gradient-to-r from-[#0CA1B7] to-[#AB9003] bg-clip-text text-transparent mb-2 flex flex-1 justify-between">
                  <span>{t("switchTo")} {curveInfo.name}</span>
                  <Button className="text-white" onClick={() => handleMax()}>{t("max")}</Button>
                </div>
              }
              <div className="text-sm text-white mb-4">{t("balance")} {!swapToggle ? tokenInfo.epixBal : tokenInfo.balance}</div>

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
                <input className="w-full pl-4 focus:outline-none focus:border-none caret-white text-white" onChange={(e) => handleChangeAmount(e, !swapToggle)} value={!swapToggle ? epixAmount : tokenAmount}></input>
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
                    onClick={() => setTokenAmount((Number(amount.slice(0, -1)) * curveInfo?.balance / 100).toString())}
                  >
                    {amount}
                  </Button>
                )))}
              </div>

              <Button className="w-full bg-yellow-500 text-white text-md hover:bg-yellow-400 font-bold" onClick={handleSwap}>
                {t("trade")}
              </Button>
              <span className="text-white mt-5 px-2 block text-sm font-bold">
                {t("thereare")} <b className="text-md">{curveInfo ? (Number(curveInfo.totalSupply) - Number(curveInfo.supply)).toFixed(2) : "1000,000,000"} {curveInfo ? curveInfo.symbol : "Token"}</b> {t("stillAvailable")}{" "}
                <b className="text-md">{curveInfo?.funds} EPIX </b>(
                <b className="text-md">{t("raisedAmount")}: 18.8 EPIX</b>){t("intheBondingCurve")}.
                {t("whenMCReached")} <b className="text-md">${Number(curveInfo.mc).toFixed(2)}</b> {t("allLiquidity")}
              </span>
            </div>
            <TokenSupply holderData={holderData} />
          </div>
        </div>
      </div>

      <Slippage
        slippage={slippage}
        setSlippage={setSlippage}
        frontRunning={frontRunning}
        setFrontRunning={setFrontRunning}
        openSlippageModal={openSlippageModal}
        setOpenSlippageModal={setOpenSlippageModal}
        deadline={deadline}
        setDeadline={setDeadline}
      />
    </section>
  );
}

export default memo(TradingView);
