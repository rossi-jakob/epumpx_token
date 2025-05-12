"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import { toast } from "react-toastify";
import { BsGlobe2 } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAccount, useConfig } from "wagmi";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";

import EasingY from "@/app/components/animations/EasingY";
import GradientEllipse from "@/app/components/gradient-ellipsis";
import TokenDetails from "@/app/components/details/token-details";
import { TokenSidebarInfo } from "@/app/components/details/token-sidebar-info";
import { TokenTrades } from "@/app/components/details/token-trades";
import { TokenSupply } from "@/app/components/details/token-supply";

import { toastConfig, isValidAddress } from "../../utils/util";

import curveABI from "@/abi/curve.json";
import erc20ABI from "@/abi/erc20.json";
import Config from "@/app/config/config";

import Chart from "@/components/tradingview";
import Slippage from "@/app/components/slippage/Slippage";

import { useCurveStatus } from "@/app/components/hooks/useCurveStatus";
import usePagination from "@/app/utils/pagination"
import Socket from "@/app/utils/socket";

function TradingView({
  tokenAddr,
  tokenInfo,
  curveInfo,
  refresh,
  setRefresh,
  // tradeInfo,
  // otherInfo
}) {
  const account = useAccount();
  const { t } = useTranslation();

  const { tradeData, holderData } = useCurveStatus(refresh, tokenAddr);

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
  const [chatTrade, setChatTrade] = useState("chat");
  const [chatPopup, setChatPopup] = useState(false);

  const [comment, setComment] = useState("");
  const [image, setImage] = useState();
  const [file, setFile] = useState(null);
  let [chatPage, setChatPage] = useState(1);
  let [tradePage, setTradePage] = useState(1);

  const container = useRef();
  const provider = new ethers.BrowserProvider(window.ethereum); // or your custom provider

  const PER_PAGE = 10;
  const fileRef = useRef();

  const imageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [allChats, setAllChats] = useState([]);

  const postComment = async () => {
    if (pending) return;
    if (!account.isConnected) {
      toast.warn("Please connect your wallet!", toastConfig);
      return;
    }
    if (comment.trim().length < 1) {
      toast.warn("Please enter a comment!", toastConfig);
      return;
    }
    let filePath = null;
    if (file && image) {
      setPending(true);
      const formData = new FormData();
      formData.append("image", image);
      const { data: response } = await axios.post(
        "/api/misc/upload_image",
        formData,
        {
          headers: {
            Accept: "*/**",
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers":
              "Access-Control-Allow-Headers, Content-Type, Authorization",
            "Access-Control-Allow-Methods": "*",
            "Cross-Origin-Resource-Policy": "*",
            timeout: 1000,
          },
        }
      );
      filePath = response.data;
    }
    if (Socket) {
      let filePath = null;
      if (file && image) {
        setPending(true);
        const formData = new FormData();
        formData.append("image", image);
        const { data: response } = await axios.post(
          "/api/misc/upload_image",
          formData,
          {
            headers: {
              Accept: "*/**",
              "Content-Type": "multipart/form-data",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers":
                "Access-Control-Allow-Headers, Content-Type, Authorization",
              "Access-Control-Allow-Methods": "*",
              "Cross-Origin-Resource-Policy": "*",
              timeout: 1000,
            },
          }
        );
        filePath = response.data;
      }
      Socket.emit(
        "NEW_COMMENT",
        account.address,
        tokenAddr,
        comment,
        filePath,
        Date.now()
      );
      setPending(false);
      setChatPopup(false);
      setComment("");
      fileRef.current.value = "";
      setImage(null);
      setFile(null);
      toast.success("Successfully posted!", toastConfig);
    }
  };

  useEffect(() => {
    const connect = () => {
      if (!account.isConnected) return;
      Socket.emit("CONNECTED", account.address, tokenAddr);
    };
    const AllChats = (_allchats) => {
      // console.log("all chats", _allchats)
      setAllChats(_allchats);
    };

    Socket.connect();
    if (tokenAddr && Socket) {
      Socket.emit("GET_ALL_CHATS", tokenAddr);
      Socket.emit("JOIN", tokenAddr);
    }

    Socket.on("connect", connect);
    Socket.on("ALL_CHATS", AllChats);

    return () => {
      Socket.off("connect", connect);
      Socket.off("ALL_CHATS", AllChats);
      Socket.disconnect();
    };
  }, [account.isConnected, account.address, tokenAddr]);

  // chat data
  const chatCount = Math.ceil(allChats?.length / PER_PAGE);
  const chatData = usePagination(allChats, PER_PAGE);
  // trade data
  const tradeCount = Math.ceil(tradeData?.length / PER_PAGE);
  const getTradeData = usePagination(tradeData, PER_PAGE);


  const handleChatChange = (e, p) => {
    setChatPage(p);
    chatData.jump(p);
  };
  const handleTradeChange = (e, p) => {
    setTradePage(p);
    getTradeData.jump(p);
  };

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
        const parsedInput = ethers.parseUnits(
          inputTokenAmount.toString(),
          Config.CURVE_DEC
        );
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(Config.CURVE, curveABI, signer);

        const result = await contract.getAmountOutETH(parsedInput, tokenAddr);
        const epixOut = Array.isArray(result) ? result[0] : result;

        const formatted = parseFloat(
          ethers.formatUnits(epixOut, Config.WETH_DEC)
        );

        _epixAmount = formatted;
        setEpixAmount(
          _epixAmount > 0.000005 ? (_epixAmount - 0.000005).toFixed(5) : "0"
        );
      }
    } catch (err) {
      console.error("Error getting amount out:", err);
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

    try {
      if (!swapToggle) {
        // buy
        _epixAmount = inputEpixAmount;
        const _curFunds = curveInfo?.funds >= 0 ? curveInfo.funds : 0;

        // apply hardcap constraint
        if (_epixAmount + _curFunds > Config.CURVE_HARDCAP) {
          _epixAmount = Config.CURVE_HARDCAP - _curFunds;
        }

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(Config.CURVE, curveABI, signer);

        const parsedAmount = ethers.parseUnits(_epixAmount.toString(), 18); // assuming EPIX is 18 decimals
        const result = await contract.getAmountOutToken(
          parsedAmount,
          tokenAddr
        );

        const formatted = parseFloat(
          ethers.formatUnits(result, Config.CURVE_DEC)
        );
        _tokenAmount = formatted;

        setTokenAmount(
          _tokenAmount > 0.005 ? (_tokenAmount - 0.005).toFixed(2) : "0"
        );
      }
    } catch (err) {
      console.error("Error calculating token amount:", err);
      setTokenAmount("0");
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
      getAmountOutEPIX(
        Number(tokenInfo?.balance ? tokenInfo?.balance : "0.00")
      );
      setBtnMsgInBepeAmount(
        Number(tokenInfo?.balance ? tokenInfo?.balance : "0.00")
      );
      3;
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
      window.open(
        `https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=${curveInfo?.token}&chain=base`
      );
      return;
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

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(Config.CURVE, curveABI, signer);

    try {
      const _deadline = parseInt(Date.now() / 1000) + Number(deadline) * 60;
      let data = {};

      if (!swapToggle) {
        if (Number(epixAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input EPIX amount to buy ${curveInfo?.symbol ?? "token"}!`,
            toastConfig
          );
          return;
        }

        try {
          setPending(true);

          const requiredEpixBal =
            Number(epixAmount) * (1 + Config.CURVE_SWAP_FEE);
          const tokenMin = (Number(tokenAmount) * (100 - slippage)) / 100;

          const referrer = window?.localStorage?.getItem("alpha_ref");
          const validRef = isValidAddress(referrer)
            ? referrer
            : "0x0000000000000000000000000000000000000000";

          const value = ethers.parseUnits(
            requiredEpixBal.toFixed(8),
            Config.WETH_DEC
          );
          const tokenMinParsed = ethers.parseUnits(
            tokenMin.toFixed(8),
            Config.CURVE_DEC
          );

          const tx = await contract.buy(
            tokenAddr,
            tokenMinParsed,
            _deadline,
            validRef,
            { value }
          );

          toast.promise(
            tx.wait(),
            {
              pending: "Waiting for pending... 👌",
            },
            toastConfig
          );

          const receipt = await tx.wait();

          if (receipt.status === 1) {
            setEpixAmount("0");
            setTokenAmount("0");
            toast.success(`Successfully swapped token! 👍`, toastConfig);
            setRefresh(!refresh);
          } else {
            toast.error("Error! Transaction failed.", toastConfig);
          }
        } catch (error) {
          console.error("Swap failed:", error);
          toast.error(
            "Transaction failed. Please check your input or try again.",
            toastConfig
          );
        } finally {
          setPending(false);
        }
      } else {
        if (Number(tokenAmount) <= 0) {
          setPending(false);
          toast.warn(
            `Please input ${curveInfo?.symbol ?? "token"} amount to sell!`,
            toastConfig
          );
          return;
        }

        try {
          setPending(true);

          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();

          const erc20Contract = new ethers.Contract(
            tokenAddr,
            erc20ABI,
            signer
          );

          const allowance = await erc20Contract.allowance(
            userAddress,
            Config.CURVE
          );

          const tokenAmountParsed = ethers.parseUnits(
            tokenAmount.toString(),
            Config.CURVE_DEC
          );

          if (allowance < Number(tokenAmountParsed)) {
            const approveTx = await erc20Contract.approve(
              Config.CURVE,
              Config.MAX_UINT256
            );

            toast.promise(
              approveTx.wait(),
              {
                pending: "Waiting for pending... 👌",
              },
              toastConfig
            );

            const approveReceipt = await approveTx.wait();
            if (approveReceipt.status !== 1) {
              setPending(false);
              toast.error("Error! Approve transaction failed.", toastConfig);
              return;
            }

            toast.success("Successfully enabled token! 👍", toastConfig);
          }

          const epixMin = (Number(epixAmount) * (100 - slippage)) / 100;

          const curveContract = new ethers.Contract(
            Config.CURVE,
            curveABI,
            signer
          );
          const sellTx = await curveContract.sell(
            tokenAddr,
            ethers.parseUnits(Number(tokenAmount).toFixed(8), Config.CURVE_DEC),
            ethers.parseUnits(epixMin.toFixed(8), Config.WETH_DEC),
            _deadline
          );
          toast.promise(
            sellTx.wait(),
            {
              pending: "Waiting for pending... 👌",
            },
            toastConfig
          );

          const sellReceipt = await sellTx.wait();
          if (sellReceipt.status === 1) {
            setEpixAmount("0");
            setTokenAmount("0");
            setRefresh(!refresh);
            toast.success("Successfully swapped token! 👍", toastConfig);
          } else {
            toast.error("Error! Sell transaction failed.", toastConfig);
          }
        } catch (err) {
          console.error("Sell error:", err);
          toast.error(
            "Transaction failed. Check console for details.",
            toastConfig
          );
        } finally {
          setPending(false);
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
                          {curveInfo?.website &&
                            curveInfo?.website.length > 0 ? (
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
                          {curveInfo?.telegram &&
                            curveInfo?.telegram.length > 0 ? (
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
                          {curveInfo?.twitter &&
                            curveInfo?.twitter.length > 0 ? (
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

                    <EasingY
                      cls="h-[500px] md:h-[calc(100%-70px)]"
                      value={-60}
                      delay={0.1}
                    >
                      <div
                        className="tradingview-widget-container h-full !border !border-gray-500 !rounded-md"
                        ref={container}
                        style={{ height: "99.5%", width: "100%" }}
                      >
                        {curveInfo.symbol && tokenAddr ? (
                          curveInfo?.status !== undefined &&
                            Number(curveInfo?.status) !== 2 ? (
                            <Chart
                              stock={"Stock"}
                              interval="1"
                              tokenId={tokenAddr}
                              symbol={`${curveInfo.symbol ? curveInfo.symbol : "---"
                                }/USD`}
                            />
                          ) : (
                            <iframe
                              src={`https://dexscreener.com/base/${tokenAddr}?embed=1&theme=dark&trades=0&info=0`}
                              className="w-full h-full"
                            />
                          )
                        ) : (
                          <></>
                        )}
                      </div>
                    </EasingY>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {/* Top: Comment & Trades Buttons */}
              <div className="flex items-center gap-2">
                {
                  <Button
                    variant={!toggleComment ? "outline" : ""}
                    className={`text-md font-bold text-white border-2 ${!toggleComment ? "border-gray-400" : ""}`}
                    onClick={() => setCommentToggle(true)}
                  >
                    {t("comment")}
                  </Button>
                }
                {
                  <Button
                    variant={toggleComment ? "outline" : ""}
                    className={`text-md font-bold text-white border-2 ${toggleComment ? "border-gray-400" : ""}`}
                    onClick={() => setCommentToggle(false)}
                  >
                    {t("trades")}
                  </Button>
                }

              </div>

              {/* new comment */}
              {toggleComment &&
                <div className="related bg-[#191C2F] w-full m-auto space-y-4 text-gray-400 rounded-4xl p-6 mt-6 h-full">
                  <div className="flex flex-col">
                    <label htmlFor="comment-box ">{t("addComment")}</label>
                    {/* text */}
                    <textarea
                      id="comment-box"
                      name="comment-box"
                      rows="10"
                      placeholder={t("writeComment")}
                      className="border-1 border-gray-400 mt-2 p-2 !text-gray-400 rounded-md"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  {/* choice image */}
                  {
                    <div className="choice-image">
                      <div className="mb-2">{t("imgOptional")}</div>
                      <label htmlFor="file-input-medium" className="sr-only">
                        {t("selectMedia")}
                      </label>
                      <input
                        type="file"
                        name="file-input-medium"
                        accept="image/png, image/gif, image/jpeg"
                        id="file-input-medium"
                        className="block w-full border-dark shadow-sm rounded-sm text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 file:bg-primary !text-dark border-2 border-dashed text-whti file:border-0 file:me-4 file:py-3
                      file:px-4 file:!text-white"
                        onChange={imageChange}
                        ref={fileRef}
                      />
                    </div>
                  }

                  {/* post button */}
                  <div className="wrap flex justify-end items-center gap-x-4 mt-4">
                    <Button
                      className="text-md font-bold text-white"
                      onClick={() => postComment()}
                    >
                      {pending ? t("uploading") : t("postComment")}
                    </Button>
                  </div>
                </div>
              }

              {/* Bottom: Comment Box or Trade Table */}
              {!toggleComment &&
                <div className="bg-[#1B1E2E] rounded-4xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#0996FF] to-[#0765D0] font-bold py-3 text-center mx-52 rounded-b-4xl">
                    {t("tokenTrades")}
                  </div>
                  {/* Trade Table */}
                  <div className="max-h-[500px] overflow-y-auto table-scroll-container px-8 mt-6">
                    <table className="table-auto w-full whitespace-nowrap">
                      <thead className="sticky top-0 bg-[#1B1E2E] z-10">
                        <tr className="text-white font-bold text-sm border-b border-gray-800">
                          <th className="text-left text-white px-4 py-2">{t("trader")}</th>
                          <th className="text-left text-white px-4 py-2">{t("type")}</th>
                          <th className="text-left text-white px-4 py-2">EPIX</th>
                          <th className="text-left text-white px-4 py-2">{t("token")}</th>
                          <th className="text-left text-white px-4 py-2">{t("time")}</th>
                          <th className="text-left text-white px-4 py-2">Tx</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tradeData && tradeData.length > 0 && getTradeData?.currentData()?.map((item, i) => (
                          <tr key={i}>
                            <td className="flex gap-1 items-center">
                              <Link
                                href={`${Config.SCAN_LINK}/address/${item.trader}`}
                                target="_blank"
                                className="text-primary"
                              >
                                {spliceAdress(item.trader)}
                              </Link>
                            </td>
                            <td>{item.isBuy ? "Buy" : "Sell"}</td>
                            <td>{Number(formatEther(item.eth)).toFixed(4)}</td>
                            <td>{Number(formatEther(item.amount)).toFixed(2)}</td>
                            <td>{new Date(item.blockTimestamp * 1000).toLocaleString()}</td>
                            <td>
                              <Link
                                href={`${Config.SCAN_LINK}/tx/${item.transactionHash}`}
                                target="_blank"
                                className="text-primary"
                              >
                                {spliceAdress(item.transactionHash)}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: tradeCount }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleTradeChange(null, page)}
                          className={`px-3 py-1 rounded-md border text-sm ${tradePage === page
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
            </div>

            {/* {!toggleComment ? (
              <TokenTrades
                tokenAddr={tokenAddr}
                tokenInfo={tokenInfo}
                curveInfo={curveInfo}
              />
            ) : (
              <span>{curveInfo.description}</span>
            )} */}
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
                <div
                  className="h-full bg-linear-to-r from-[#8346FF] to-[#9458DF]"
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
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-[#191C2F] rounded-4xl p-6">
              {/* <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Label className="text-white font-bold">
                    {t("mevProtection")}
                  </Label>
                  <button
                    onClick={() => setMEVProtect(!mevProtect)}
                    className={`w-12 h-6 rounded-full transition-colors relative bg-gray-700`}
                  >
                    {!mevProtect ? (
                      <div
                        className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#8346FF] to-[#9458DF] top-0.5 transition-transform`}
                      />
                    ) : (
                      <div
                        className={`absolute w-5 h-5 rounded-full bg-linear-to-r from-[#8346FF] to-[#9458DF] top-0.5 left-7 transition-transform`}
                      />
                    )}
                  </button>
                </div>
              </div> */}

              <div className="grid grid-cols-2 gap-2 mb-4">
                {!swapToggle ? (
                  <Button
                    className="font-bold text-white text-md"
                    onClick={() => setSwapToggle(false)}
                  >
                    {t("buy")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="font-bold text-white text-md"
                    onClick={() => setSwapToggle(false)}
                  >
                    {t("buy")}
                  </Button>
                )}
                {!swapToggle ? (
                  <Button
                    variant="outline"
                    className=" text-white font0-bold text-md"
                    onClick={() => setSwapToggle(true)}
                  >
                    {t("sell")}
                  </Button>
                ) : (
                  <Button
                    className=" text-white font0-bold text-md"
                    onClick={() => setSwapToggle(true)}
                  >
                    {t("sell")}
                  </Button>
                )}
              </div>

              {!swapToggle && (
                <div className="text-sm bg-gradient-to-r from-[#0CA1B7] to-[#AB9003] bg-clip-text text-transparent mb-2 flex flex-1 justify-between">
                  <span>
                    {t("switchTo")} {curveInfo.name}
                  </span>
                  <Button className="text-white" onClick={() => handleMax()}>
                    {t("max")}
                  </Button>
                </div>
              )}
              <div className="text-sm text-white mb-4">
                {t("balance")}{" "}
                {!swapToggle ? tokenInfo.epixBal : tokenInfo.balance}
              </div>

              <div className="flex items-center space-x-2 mb-4 bg-[#232321] p-3 rounded-4xl">
                {!swapToggle ? (
                  <img
                    src="/token-icon.svg"
                    className="w-6 h-6 rounded-full"
                    alt="Token"
                  />
                ) : (
                  <img
                    src={curveInfo.logo}
                    className="w-6 h-6 rounded-full"
                    alt="Token"
                  />
                )}
                <span className="text-white font-bold">
                  {!swapToggle ? "EPIX" : curveInfo.name}
                </span>
                <input
                  className="w-full pl-4 focus:outline-none focus:border-none caret-white text-white"
                  onChange={(e) => handleChangeAmount(e, !swapToggle)}
                  value={!swapToggle ? epixAmount : tokenAmount}
                ></input>
              </div>

              <div
                className={`grid ${!swapToggle ? "grid-cols-3" : "grid-cols-4"
                  } gap-2 mb-6`}
              >
                {!swapToggle
                  ? ["10 EPIX", "50 EPIX", "100 EPIX"].map((amount) => (
                    <Button
                      key={amount}
                      variant="ghost"
                      className="bg-[#232321] text-white font-bold hover:bg-[#2C2C2C] hover:text-white cursor-pointer"
                      onClick={() => setEpixAmount(amount.split(" ")[0])}
                    >
                      {amount}
                    </Button>
                  ))
                  : ["25%", "50%", "75%", "100%"].map((amount) => (
                    <Button
                      key={amount}
                      variant="ghost"
                      className="bg-[#232321] text-white font-bold hover:bg-[#2C2C2C] hover:text-white cursor-pointer"
                      onClick={() =>
                        setTokenAmount(
                          (
                            (Number(amount.slice(0, -1)) *
                              tokenInfo?.balance) /
                            100
                          ).toString()
                        )
                      }
                    >
                      {amount}
                    </Button>
                  ))}
              </div>
              <Button
                onClick={handleSwap}
                disabled={pending || (Number(curveInfo?.status) == 2)}
                className={`w-full text-white text-md font-bold transition-colors ${pending
                    ? "bg-yellow-300 cursor-not-allowed pointer-events-none"
                    : "bg-yellow-500 hover:bg-yellow-400"
                  }`}
              >
                {pending ? "Trading..." : t("trade")}
              </Button>
              <span className="text-white mt-5 px-2 block text-sm font-bold">
                {t("thereare")}{" "}
                <b className="text-md">
                  {curveInfo
                    ? (
                      Number(curveInfo.totalSupply) - Number(curveInfo.supply)
                    ).toFixed(2)
                    : "1000,000,000"}{" "}
                  {curveInfo ? curveInfo.symbol : "Token"}
                </b>{" "}
                {t("stillAvailable")}{" "}
                <b className="text-md">{curveInfo?.funds} EPIX </b>(
                <b className="text-md">{t("raisedAmount")}: 8500 EPIX</b>)
                {t("intheBondingCurve")}.{t("whenMCReached")}{" "}
                <b className="text-md">${Number(curveInfo.mc).toFixed(2)}</b>{" "}
                {t("allLiquidity")}
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
